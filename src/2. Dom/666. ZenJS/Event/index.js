import ZenJS from "../../../shared/global/ZenJS/index";
import assign from "../../../shared/global/Object/assign";
import defineProperty from "../../../shared/global/Object/defineProperty";
import isFunction from "../../../shared/util/isFunction";
import returnTrue from "../../../shared/util/returnTrue";
import returnFalse from "../../../shared/util/returnFalse";


/*
 * event.target : 触发事件的元素
 * event.originalTarget : 绑定事件的元素, 如果是委托代理, 则为代理的元素
 * event.delegateTarget : 绑定事件的元素
 * event.relatedTarget : 事件的相关节点, mouseover 时移出的节点, mouseout 时移入的节点
 *
 * event.preventDefault() : 阻止浏览器默认行为
 * event.stopPropagation() : 停止将事件冒泡到父节点
 * event.stopImmediatePropagation() : 停止将事件冒泡到父节点且停止当前元素后续事件执行
 */


const Event = ZenJS.Event = function( src, props ){

  if( this instanceof Event === false ){
    return new ZenJS.Event( src, props );
  }

  if( src instanceof Event ){
    return src;
  }

  // Event object
  if( src && src.type ){

    this.originalEvent = src;

    this.isDefaultPrevented =
      src.defaultPrevented ||
      src.defaultPrevented === undefined && src.returnValue === false
        ? returnTrue
        : returnFalse;

    this.target = ( src.target && src.target.nodeType === 3 )
      ? src.target.parentNode
      : src.target;

    for( let key in src ){
      if( !( key in this ) ){
        this[ key ] = src[ key ];
      }
    }
  }
  // Event type
  else{
    this.type = src;
  }

  if( props ){
    assign( this, props );
  }

  this.timeStamp = src && src.timeStamp || Date.now();

}


const EventProto = Event.prototype = {
  constructor: Event
};

[ 'preventDefault', 'stopPropagation', 'stopImmediatePropagation' ].forEach( fn => {
  EventProto[ fn ] = function(){
    if( this.originalEvent ){
      this.originalEvent[ fn ]();
    }
  }
});


const addProp = Event.addProp = function( name, get ){
  defineProperty( EventProto, name, {
    enumerable: true,
    configurable: true,
    get: isFunction( get )
      ? function(){
        if( this.originalEvent ) return get( this.originalEvent );
      }
      : function(){
        return this[ name ];
      },
    set( value ){
      this[ name ] = value;
    }
  });
};



const rkeyEvent = /^key/,
      rmouseEvent = /^(?:mouse|pointer|contextmenu|drag|drop)|click/;

addProp( 'which', function( event ){
  let button;

  if( event.which == null && rkeyEvent.test( event.type ) ){
    return event.charCode != null ? event.charCode : event.keyCode;
  }

  if( !event.which && ( button = event.button ) !== undefined && rmouseEvent.test( event.type ) ){
    if ( button & 1 ) return 1;
    if ( button & 2 ) return 3;
    if ( button & 4 ) return 2;
    return 0;
  }

  return event.which;
});



addProp( 'wheelDelta', ( event, wheelDelta ) => {
  if( wheelDelta = event.wheelDelta ){
    return wheelDelta;
  }else if( wheelDelta = event.detail ){
    return wheelDelta > 0 ? -120
                          : 120;
  }
});

addProp( 'detail', ( event, detail ) => {
  if( detail = event.detail ){
    return detail;
  }else if( detail = event.wheelDelta ){
    return detail > 0 ? -3
                      : 3;
  }
});