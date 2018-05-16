import define from '../../shared/util/defineValue';
import Object from '../../shared/global/Object';


export default function $isEmptyObject( obj ){
  for( let a in obj ){
    return false;
  }
  return true;
}

define( Object, '$isEmptyObject', $isEmptyObject );