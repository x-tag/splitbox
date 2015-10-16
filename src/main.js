(function(){

  function startDrag(node, splitter, event){

    node.setAttribute('x-splitter-dragging', '');

    var props = getProps(node);
    var lastCoord = event[props.page];
    var next = splitter.nextElementSibling, next = !next.hasAttribute('splitter') && next;
    var previous = splitter.previousElementSibling, previous = !previous.hasAttribute('splitter') && previous;

    node.xtag.drag = xtag.addEvent(node, 'move', function(e){
      var coord = e[props.page];
      if (props.bounds.start < coord && coord < props.bounds.end) {

        var delta = coord > lastCoord ? coord - lastCoord : coord - lastCoord;
        var previousSize = (previous[props.offset] + delta) / props.parentSize;
        var nextSize = (next[props.offset] - delta) / props.parentSize;

        if (previousSize > 0 && nextSize > 0) {
          if (previous) setMinMax(previous, props, previousSize);
          if (next) setMinMax(next, props, nextSize);
        }
        else {
          var combine = next[props.offset] / props.parentSize + previous[props.offset] / props.parentSize;
          if (previousSize <= 0){
            if (next) setMinMax(next, props, combine);
            if (previous) setMinMax(previous, props, 0);
          }
          else if (nextSize <= 0){
            if (previous) setMinMax(previous, props, combine);
            if (next) setMinMax(next, props, 0);
          }
        }
      }
      lastCoord = coord;
    });
  }

  function getProps(node){
    var props = node.xtag.props = (node.direction == 'column') ? {
      page: 'pageY',
      offset: 'offsetHeight',
      auto: { max: 'maxWidth', min: 'minWidth' },
      style: { max: 'maxHeight', min: 'minHeight' },
      bounds: { start: node.offsetTop, end: node.offsetTop + node.offsetHeight }
    } : {
      page: 'pageX',
      offset: 'offsetWidth',
      auto: { max: 'maxHeight', min: 'minHeight' },
      style: { max: 'maxWidth', min: 'minWidth' },
      bounds: { start: node.offsetLeft, end: node.offsetLeft + node.offsetWidth }
    };
    props.parentSize = node[props.offset];
    return props;
  }

  function setPercents(node, props){
    node.xtag.panels = xtag.queryChildren(node, '*:not([splitter])').map(function(el){
      setMinMax(el, props, el[props.offset] / props.parentSize);
      el.style[props.auto.max] = 'none';
      el.style[props.auto.min] = 'auto';
      return el;
    });
  }

  function setMinMax(panel, props, value){
    panel.style[props.style.max] = panel.style[props.style.min] = value * 100 + '%';
  }

  function stopDrag(node){
    if (node.xtag.drag) {
      xtag.removeEvent(node, node.xtag.drag);
      node.removeAttribute('x-splitter-dragging');
      node.xtag.drag = null;
    }
  }

  xtag.addEvent(window, 'tapend', function(e){
    xtag.query(document, 'x-splitbox[x-splitter-dragging]').forEach(stopDrag);
  })

  xtag.register('x-splitbox', {
    events: {
      'tapstart:delegate(x-splitbox > [splitter])': function(e){
        startDrag(e.currentTarget, this, e);
      },
      'dragstart:delegate([x-splitter-dragging])': function(e){
        return false;
      }
    },
    accessors: {
      direction: {
        attribute: {},
        set: function(direction){
          setPercents(this, getProps(this));
        }
      }
    }
  });

})();
