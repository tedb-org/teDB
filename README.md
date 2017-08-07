# [TeDB](https://github.com/tsturzl/teDB)
A TypeScript Embedded Database. A structure sane embedded database with [pluggable storage](https://tedb-org.github.io/#writing-a-storage-driver-for-tedb) and clean concise [documentation](https://tedb-org.github.io/).

## Install

```bash
npm install --save tedb
```
## Resources:

 * [API Documentation](https://tedb-org.github.io/)

## Usage
TeDB uses an AVL balanced binary tree [binary-type-tree](https://github.com/marcusjwhelan/binary-type-tree) to save indexed fields of documents. TeDB does not save documents to memory or have a set way of saving data. It is hooked up to a storage driver that can either work to persists data to disk or save data to memory. The binary tree only saves the value and _id to memory allowing for larger data sets to be indexed. 

Almost all operations use a method of the storage driver to save, delete, or search, for documents. This is why a robust storage driver is needed more specifically fit your needs. Feel free to write your own storage driver and possibly have it mentioned below for others to use. TeDB is almost completely Promise based and you can expect each method to return a promise, even if the return is null or never. A large benefit to using TeDB is it is written 100% in Typescript. Except for one javascript preprocessor for Jest. 

```typescript
// ES6 options
import * as tedb from "tedb";
import { Datastore, IDatastore, Cursor, Ioptions, IindexOptions,
 IupdateOptions, Index, IIndex, IStorageDriver, IRange, range,
 isEmpty, getDate, compareArray, rmObjDups, getPath, Base64,
 expandObj, compressObj, flatten, saveArrDups, getDups, rmArrDups} from "tedb";
// ES5 options
var tedb = require("tedb");
var Datastore = require("tedb").Datastore;
```


## Writing a storage driver for TeDB
There is a very simple example of a NodeJS storage driver in the `/spec/example` directory that is used for the testing of the datastore. You can also see an example of what a data store preferably should look like from your storage driver for nodejs in the `/spec/fixtures/db` directory. When creating a storage driver that persists to a filesystem for FAT32, NTFS, ext2, ext3, and ext4 most directories use a binary tree store the location of the file. So utilizing this it is faster to query the file instead of having to create another binary tree to hold the location of a document in a file. [source](https://stackoverflow.com/questions/466521/how-many-files-can-i-put-in-a-directory). 

This however is not always the case and this is why many different storage drivers are needed for more specific situations where possibly on mobile this is not the best option. But for these other file systems you could have a datastore with around 4.3 billion documents. With each database capable of 4.3 billion datastores. This of course is dependant on the storage driver you create and the way in which the storage driver saves its data. 

Memory only storage drivers could utilize other in memory databases such as indexedDB. I would be on the lookout for in memory javascript databases because this project was started in the response to other javascript embedded databases indexing entire documents for speed. This can with a large enough database overload your memory and bring your application to a halt.

## Storage drivers

 * [Example Link ]()


## Table of Contents

* <a href="#usage">Usage</a>
* <a href="#writing-a-storage-driver-for-tedb">Writing a storage driver for TeDB</a>
* <a href="#creating-a-datastore">Creating a Datastore</a>
* <a href="#indexing">Indexing</a>
* <a href="#inserting">Inserting</a>
* <a href="#findcount-and-get-date-from-_id">Find/Count and Get Date from _id</a>
* <a href="#update">Update</a>
* <a href="#remove">Remove</a>
* <a href="#utilities">Utilities</a>
* <a href="#license">License</a>
 
## Creating a Datastore
Each database will consist of however many datastores you would like to create. Depending on your storage driver your datastores will save data differently but to simply create a datastore you only need to connect an instance of the storage driver to an instance of a new Datastore. The storage driver represented in this example is a pointer to any storage driver you decide to use, "yourStorageDriverClass".
```typescript
import * as tedb from "tedb";
// For example, I want to make Users
const UserStorage = new yourStorageDriverClass("users");
const Users = new tedb.DataStore({storage: UserStorage});
```
For the storage driver it should have the methods found on the storage driver interface found [here](https://github.com/tsturzl/teDB/blob/master/src/types/storageDriver.ts). Now that you have the datastore created you can insert and query on those inserted items. Each item inserted has an automatic `_id` generated for them. This `_id` also saves the created on Date. The `_id`s are not indexed automatically but can be if you decide to.
 
## Indexing
Indices are saved as a Map on the Datastore class for each property. When you create an index on a property you give the path of the index and then the options of that index. Indices are stored as a key, value store with the key being the value given i.e. the actual username. And where the value of the key value storey is actually the _id of the object. `_id`s are created each time you insert an object into TeDB. The values of the key value store are always arrays. `{ "myUserNameValue": ["_idofobject"]}` if the index is not unique then the value is still an array except for each matching key the new ids are added. `{ "actualAge#": ["_id1", "_id2", "_id3"]}`.
* Index Options
    * fieldName - The path as a string `"path.to.index"` to be indexed on the object
    * unique - Set value to have a unique restriction or not
    * checkKeyEquality - You can pass your own equality check method: [Default](https://github.com/marcusjwhelan/binary-type-tree/blob/master/src/bTreeUtils.ts#L92)
    * compareKeys - You can pass your own method to compare keys: [Default](https://github.com/marcusjwhelan/binary-type-tree/blob/master/src/bTreeUtils.ts#L44)
```typescript
// Create Index
// Returns a promise of null
return Users.ensureIndex({fieldName: "username", unique: true});
```

If you ever need to use some of the other index methods such as `insertIndex`, `removeIndex`, or `saveIndex` the `getIndices` will be needed. **DS stands for Datastore** and **SD for Storage Driver**.
* getIndices: **DS** - returns a promise containing the index map of this datastore
* saveIndex: **DS** - saves a JSON representation of the index using the storage driver
* removeIndex: **DS** - Removes the index from the datastore - does not delete index from storage driver automatically. If you want to remove the index from storage use the storage driver's removeIndex method.
* insertIndex: **DS** - Insert a JSON representation of an index into this datastore's index Map.
* removeIndex: **SD** - Should delete the location of the stored index, dependent on the SD method.
* fetchIndex: **SD** - Should return the **parsed** index from storage
* storeIndex: **SD** - Should save the index

```typescript
// I am assuming all success
// Create an index and store it - can create nested index -> "nested.index.path" instead of "age"
Users.ensureIndex({fieldName: "age"})
    .then(() => {
        return // insert several documents so the bTree is filled
    })
    .then(() => {
        // converts index to json and saves using storage driver
        // storeIndex method, returns a promise of whatever the storage driver
        // returns. 
        return Users.saveIndex("age");
    })
    .then(/** success */)
    .catch();
//
// On start up you might want to load the saved index to skip creating the btree for
// each datastore, this should save load times of applications.
let index: any[];
UserStorage.fetchIndex("age")
    .then((indexArray) => {
        index = indexArray;
        // need to insert the index into the current datastore
        return Users.ensureIndex({fieldName: "age"});
    })
    .then(() => {
        return Users.insertIndex("age", index);
    })
    .then(/** success */)
    .catch();
//
// Search an index manually
Users.getIndices()
    .then((indices) => {
        const IndexName = indices.get("age");
        if (IndexName) {
            return IndexName.search(32);
        }
    })
    .then((ids) => {
        return UserStorage.getItem(ids[0]);
    })
    .then((user) => { /** success */})
    .catch();
//
// Remove Index from datastore and from storage
Users.removeIndex("age")
    .then(() => {
        return UserStorage("age");
    })
    .then(() => { /** success */})
    .catch();
```

## Inserting
Inserting a document is rather simple and dependent on your indices if you are able to insert a document or not. Depending on indexed fields the insert will fail if for instance a field is indexed, unique, and an array. If you did not specify a special array comparison method fo the index then the insert will fail because the default comparison method only compares strings, numbers, and Dates.
```typescript
Users.insert({name: "xyz", age: 30})
    .then((doc) => {
        console.log(doc) // {_id: "...", name: "xyz", age: 30} 
    })
    .catch();
// Insert many
const docs: any[] = insertables; // your array of documents
const promises: Array<Promise<any>> = [];
docs.forEach((doc) => {
    promises.push(Users.insert(doc));    
});
Promise.all(promises)
    .then(() => { /** success */ })
    .catch();
```

## Find/Count and Get Date from _id
Find uses a cursor class to work through a query object. Find always returns an array.
* Cursor Options
   * sort - Sort by field {fieldName: -1 } or {fieldName: 1 }
   * skip - Skip a certain number of returned items 
   * limit - Set a limit to max number of items returned
   * exec - execute the search using the cursor options, will search for all docs based on query before applying the sort, skip, or limit methods on them. 
     
The find method actually will search through all the documents queried by either the index if indexed or by a collection search if not indexed. In the storage driver when documents are inserted, or removed their should be a keys array holding the keys of all the documents inserted just in case a field is searched without a query. If you search with an empty query the **keys** method of the storage driver is used that should return all the _ids of the datastore instead of having to retrieve all the keys from the storage driver memory/drive. 

If you would rather not store memory for each _id inserted then use a storage driver that does not use the keys() method and you will not be able to search without a query.

Find now supports a special sort field **$created_at** for sorting your documents by created at time. Each _id holds 
the time of creation down to the millisecond. We would advise against creating your own created_at time or any `$` 
fields in your documents. We might, in the future, add extra functionality to more `$` fields.

* Find query options
    * $or - search an object query of one **or** multiple
    * $and - search an object with **and** results or multiple
    * $gt, $lt, $gte, $lte, $ne - can combine any assortment.
    
Nesting queries is now supported but only in $and or $or. Cannot nest value inside $gt.. query options. No nesting $and or $or inside one another.

```typescript
// Example of nesting
Users.find({$and: [
    {age: {$gt: 25}},
    {age: {$ne: 28}},
    {age: {$lte: 35}},
    ]}).exec()
    .then(resolve)
    .catch(reject);
``` 

```typescript
// Using the $created_at sort - sorts by time doc was created.
Users.find({})
    .sort({$created_at: -1}) // descending
    // or
    .sort({$created_at: 1}) // ascending
    .exec()
    .then(resolve)
    .catch(reject);
```

```typescript
// simple find
Users.find({name: "xyz"})
    .exec()
    .then((docs) => {
        console.log(dos[0]); // {_id: "...", name: "xyz", age: 30}
    });
// find all
Users.find()
    .exec()
    .then((docs) => {
        console.log(docs.length); // length of all docs
    });
// $or
Users.find({$or: [{age: 0}, {name: 30}]})
    .exec()
    .then(/** success */);
// $and
Users.find({$and: [{name: "Francis"}, {name: "xyz"}]})
    .exec()
    .then(/** success*/);
// find all with all cursor options
Users.find({}) // can also send empty object
    .sort({age: -1})
    .skip(1)
    .limit(1)
    .exec()
    .then((docs) => {
        console.log(docs.length); // 1
    });
// Search Nested
Users.find({"nested.age.path": {$gte: 0, $lte: 31}})
    .exec()
    .then((docs) => /** success */);
// COUNT
// count uses the same query searching capabilities as find except only returns the number of docs
Users.count({})
    .exec()
    .then((num) => {
        console.log(num); // total docs as a number
    });
//
// If you would like to find an object that happens to have
// no index or _id/lets say you removed the _id by accident.
const doc = {/* exact doc match you want to find */};
const target = {};
compressObj(doc, target);
Users.find(target)
    .then(resolve)
    .catch(reject);
```
TeDB also stores the time inserted.
```typescript
Users.find()
    .exec()
    .then((docs) => {
        // example _id = "UE9UQVJWd0JBQUE9cmZ4Y2MxVzNlOFk9TXV4dmJ0WU5JUFk9d0FkMW1oSHY2SWs9"
        const createdAt = Users.getIdDate(docs[0]._id);
        console.log(createdAt); // Date Object -> 2017-05-26T17:14:48.252Z
    })
```

## Update
Update uses find to retrieve the objects and the storage driver to write back the changes if any need to be done. All update operations update the index as well if one exists. Although it does not update the stored JSON index. You must update that yourself by overwriting the old stored index. 
* Update Options
    * multi - return many documents: Default false
    * upsert - insert the document if not found: Default false, creates _id on insert
    * returnUpdatedDocs - returns all the docs after being updated and stored.
    * exactObjectFind - when finding objects search based on the exact object itself. Cannot use find queries such as $gt, $lt. Best used with updating an object completely if anything changes.
* Update Operators
    * $set - write, overwrite a value to the document/s that are returned. Warning Cannot create an object from undefined.
    * $mul - multiply the value with the given query value
    * $inc - increment a positive or negative number to the value of the document
    * $unset - delete the value from the object
    * $rename - rename the key of a document, logically uses $unset then $set saving the value to memory in between.
You can work all the update options together, dependent on order.

```typescript
// original object {_id: "...", name: "xyz"}
// query, operators, options
Users.update({name: "xyz"}, {$set: {"nested": {"key": 1}}, $inc: {"nested.key": 3},
    $mul: {"nested.key": 2}, $rename: {"nested.key": "accounts"}, 
    $unset: {"name": ""}}, {returnUpdatedDocs: true})
    .then((docs) => {
        console.log(docs[0]); // {_id: "...", nested: { accounts: 8 }}
    });
// example of exactObjectFind
// exactObjectFind. you must send in object formatting.
Users.update({
        name: "t",
        nested: {
            key: 2
        },
    }, {
        $set: {"nested": {"key": 1}},
    }, {
        returnUpdatedDocs: true,
        upsert: true,
        exactObjectFind: true,
    })
    .then((docs) => {
        console.log(docs[0]); // {_id: "...", name: "t", nested: {key: 1}}
    });
// with another object
const incomingObj = externalAPI.request.data[0];
Users.update(incomingObj, {$set: {synced: true}}, {
        upsert: true,
        exactObjectFind: true    
    })
    .then(resolve)
    .catch(reject);
```

The `exactObjectFind` param is great for pulling down a repo that and updating lots of data. If you pull down data and need to compare it to an already stored object and rewrite that object if the incoming data has changed. This is the perfect solution. Upsert if not found and can send an entire object.

## Remove
Uses the find method to retrieve _ids and removes multiple always, as well as removing indexed items from the Mapped indices for all indexed items on a object. 
```typescript
Users.remove({"nested.accounts": 8})
    .then((num) => {
        console.log(num); // 1
        return Users.find({"nested.accounts": 8});
    })
    .then((docs) => {
        console.log(docs.length); // 0
    });
// If you would like to remove an object that exactly
// matches all parameters. If lets say you remove _id then 
// you can use compressObj. Useful when you do not want to 
// remove many.
const doc = {/* contents */};
const target = {};
compressObj(doc, target);
Users.remove(target)
    .then(resolve)
    .catch(reject);
```

## Utilities
There are many methods used internally for TeDB that are tested against many other methods to be very quick and easy to use. Some were build as promises and other as regular functions. The reason for each is dependant on how it is used within TeDB. However these methods have such great use we decided to export them and have them available to use. To keep the dependency list to only one, which is also written by one of the active contributors, we had to write many of our own helper methods instead of importing a larger library with many unused methods. Making this package a standalone database.

* TeDB Utilities
    * range - create range of utf8 characters given two utf8 characters, or numbers descending/ascending
    * isEmpty - Return true if {}, [], "", null, undefined
    * getDate - Used to retrieve the Date from a _id of Datastore document if you would rather not used the Datastore method available.
    * rmObjDups - remove duplicate objects from an array. Only works for comparable `===` values
    * getPath - get the value given dot notated string path `"path.in.object"`
    * Base64: class - encode and decode base 64 encoding with `==` at the end. used to make _ids
    * compareArray - Compare two arrays of equal length, returns 0 if equal, -1 if first is less and 1 if greater. Comparison only works for types **string, number, Date**
    * NEW compressObj: - Convert object notation into dot object notation.
    * NEW expandObj: - Convert dot string notated object into expanded object.
    * NEW flatten: - Compress arrays of arrays into one array.
    * NEW saveArrDups: - Save duplicated items in array of arrays.
    * NEW getDups: - Compare two arrays and get only the duplicate items in new array.
    * NEW rmArrDups: - Remove duplicate items in array.
    
range
```typescript
const numbers: number[] = range(-5, 5) as number[]; // have to specify - bc multiple possibilities
const strs: string[] = range("a", "b") as string[]; // utf8 range
```
isEmpty
```typescript
console.log(isEmpty([]) && isEmpty({}) && isEmpty("") && isEmpty(null) && isEmpty(undefined)); // true
```
getDate - shown above

rmObjDups
```typescript
const list = any[] = [
    {a: "a"}, {a: "a"}, {a: "b"}, {a: "c"}, {a: "c"}, {a: "b"}
];
const newList = rmObjDups(list, "a");
console.log(newList); // [{a: "a"}, {a: "b"}, {a: "c"}]
```
getPath
```typescript
const obj = {nested: {value: {is: {here: 3}}}};
console.log(getPath("nested.value.is.here")); // 3
```

Base64 - recommend reading the source

compressObj
```typescript
const doc: any = { example: {obj: [1,2], is: "d"}, great: 9};
const target: any = {};
compressObj(doc, target);
console.log(target); 
// output
/*{
  "example.obj.0": 1,
  "example.obj.1": 2,
  "example.is": "d",
  "great": 9,
}*/
```
expandObj
```typescript
const doc = {
  "nested.reg.obj": 5,
  "nested.dot.0": 3,
  "nested.dot.1": 4,
  "is": "nested",
  "very.nested.obj.is.nested.far.in.obj": "hello";
}
const expanded = expandObj(doc);
console.log(expanded);
// output
/*{
  nested: {
      reg: {
        obj: 5,
      },
      dot: [3, 4],
  },
  is: "nested",
  very: {nested: {obj: {is: {nested: {far: {in: {
    obj: "hello",
  }}}}}}}
}*/
```
flatten
```typescript
const hArray = [[1,2], 3, [[[[4]],[5]]],[6,[[[7]]]]];
console.log(flatten(hArray)); // [1,2,3,4,5,6,7];
```
saveArrDups
```typescript
const dArray = [[1,2],[1],[23,4,1,2]];
saveArrDups(dArray)
    .then((res) => {
        console.log(res); // [1, 1, 1];
    });
```
getDups
```typescript
const da = [1, 2, 3];
const db = [2, 3, 5];
console.log(getDups(da, db)); // [2, 3];
```
rmArrDups
```typescript
const arrayD = [1, 1, 1, 2, 2, 3];
console.log(rmArrDups(arrayD)); // [1, 2, 3];
```  

## License
See [License](LICENSE)
