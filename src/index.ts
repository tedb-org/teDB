/**
 * Created by tsturzl on 4/11/17.
 */

import Datastore from "./datastore";
import Cursor from "./cursor";
import Index from "./indices";

import { IIndex } from "./indices";
import { Ioptions } from "./cursor";
import { IDatastore } from "./datastore";
import { IStorageDriver, IRange, IindexOptions, IupdateOptions, Isanitize, Iexist } from "./types";

export { range, isEmpty, getDate, compareArray, rmObjDups, getPath, Base64, compressObj, expandObj, flatten, saveArrDups, getDups, rmArrDups} from "./utils";
export { Datastore, IDatastore };
export { Cursor, Ioptions };
export { Index, IIndex };
export { IStorageDriver, IRange, IindexOptions, IupdateOptions, Isanitize, Iexist };
