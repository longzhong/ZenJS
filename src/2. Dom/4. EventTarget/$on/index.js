import isObject from "../../../shared/util/isObject";
import isString from "../../../shared/util/isString";
import rnothtmlwhite from "../../../shared/const/rnothtmlwhite";
import isBoolean from "../../../shared/util/isBoolean";
import returnTrue from "../../../shared/util/returnTrue";
import returnFalse from "../../../shared/util/returnFalse";
import keys from "../../../shared/global/Object/keys";
import ZenJS from "../../../shared/global/ZenJS/index";
import { supportsPassiveEvent } from "../../../shared/supports/passive-event";
import inBrowser from "../../../shared/const/inBrowser";
import defineValue from "../../../shared/util/defineValue";
import DomEventTarget from "../../../shared/global/DomEventTarget/index";
import EventListener from "../../666. ZenJS/EventListener/index";
import assign from "../../../shared/global/Object/assign";
import { isArray } from "../../../shared/const/type";


/**
 * 绑定事件 => 参数处理
 * @param {Element} elem 需要绑定事件的对象
 * @param {String} types 需要绑定的事件集
 * @param {String} selector 事件委托的选择器
 * @param {Function} listener 绑定的事件
 * @param {Object} options 事件绑定参数
 * @param {Boolean} once 事件只执行一次
 */
function on( elem, types, selector, listener, options, once ){
  let events;
  let mainGroup, group, data;

  // 1. on( elem, { type: listener || Boolean } )
  // 2. on( elem, { type: listener || Boolean }, options )
  // 3. on( elem, { type: listener || Boolean }, options, selector )
  // 4. on( elem, { type: listener || Boolean }, selector )
  // 5. on( elem, { type: listener || Boolean }, selector, options )
  if( isObject( types ) ){
    events = types;

    if( isString( selector ) ){// 4, 5
      options = listener;
    }else{// 1, 2, 3
      options = selector;
      selector = listener;
    }
  }
  // on( elem, selector, { type: listener || Boolean } )
  // on( elem, selector, { type: listener || Boolean }, options )
  else if( isObject( selector ) ){
    events = selector;
    selector = types;
    options = listener;
  }

  if( events ){
    for( let type in events ){
      on( elem, type, events[ type ], selector, options );
    }
    return elem;
  }

  if( !types ) return elem;
  else{
    types = types.match( rnothtmlwhite );

    if( types == null || types.length === 0 ){
      return elem;
    }
  }

  // on( elem, types, listener || Boolean )
  // on( elem, types, listener || Boolean, selector )
  // on( elem, types, listener || Boolean, selector, options )
  if( !isString( selector ) ){
    [ selector, listener ] = [ listener, selector ];

    // on( elem, types, listener || Boolean, options )
    // on( elem, types, listener || Boolean, options, selector )
    if( !isString( selector ) && ( options === undefined || isString( options ) ) ){
      [ options, selector ] = [ selector, options ];
    }
  }

  if( isBoolean( listener ) ){
    listener = listener ? returnTrue : returnFalse;
  }

  if( !listener ){
    return elem;
  }

  // useCapture
  if( isBoolean( options ) ){
    options = { capture: options };
  }else{
    options = options ? assign( {}, options )
                      : {};
  }

  // mainGroup
  // group
  // 事件分组功能, 分到同一组的事件可进行同时移除
  if( 'group' in options ){
    group = options.group;

    if( group[ isArray ] ){
      mainGroup = group[0];
      group = group[1];
    }

    delete options.group;
  }

  if( 'data' in options ){
    data = options.data;
    delete options.data;
  }

  keys( options ).forEach( key => {
    options[ key ] ? options[ key ] = true
                   : delete options[ key ];
  });

  if( once || options.one || options.once ){
    const origListener = listener;

    listener = function( event ){
      elem.$off( event );
      return origListener.apply( this, arguments );
    }

    listener.guid = origListener.guid || ( origListener.guid = ZenJS.guid );

    delete options.one;
    delete options.once;
  }

  if( options.passive && !supportsPassiveEvent ){
    delete options.passive;
  }

  types.forEach( type => {
    EventListener.add( elem, type, selector, listener, options, mainGroup, group, data );
  });

  return elem;
}


if( inBrowser ){

  defineValue( DomEventTarget, '$on', function( types, selector, listener, options ){
    const elem = this || window;
    return on( elem, types, selector, listener, options );
  });

  defineValue( DomEventTarget, '$one $once', function( types, selector, listener, options ){
    const elem = this || window;
    return on( elem, types, selector, listener, options, true );
  });

}