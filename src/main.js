(function(){

  function startDrag(node, splitter, event){

    node.setAttribute('x-splitter-dragging', '');

    var props = getProps(node);
    var lastCoord = event[props.page];
    var next = splitter.nextElementSibling, next = !next.hasAttribute('splitter') && next;
    var previous = splitter.previousElementSibling, previous = !previous.hasAttribute('splitter') && previous;

    setPercents(node, props);

    node.xtag.drag = xtag.addEvent(node, 'move', function(e){
      var coord = e[props.page];

        var delta = coord > lastCoord ? coord - lastCoord : coord - lastCoord;

        if (coord >= previous[props.edge] && coord <= next[props.edge] + next[props.offset]) {
          var previousSize = previous[props.offset] + delta;
          var nextSize = next[props.offset] - delta;
          
          if (previousSize > 0 && nextSize > 0) {
            if (previous) setMinMax(previous, props, previousSize);
            if (next) setMinMax(next, props, nextSize);
            lastCoord = coord;
          }
          else {
            var combine = next[props.offset] + previous[props.offset];
            if (previousSize <= 0){
              if (next) setMinMax(next, props, combine);
              if (previous) setMinMax(previous, props, 0);
            }
            else if (nextSize <= 0){
              if (previous) setMinMax(previous, props, combine);
              if (next) setMinMax(next, props, 0);
            }
            else lastCoord = coord;
          }
        }
    });
  }

  function getProps(node){
    var props = node.xtag.props = (node.direction == 'column') ? {
      page: 'pageY',
      offset: 'offsetHeight',
      edge: 'offsetTop',
      auto: { max: 'maxWidth', min: 'minWidth' },
      style: { max: 'maxHeight', min: 'minHeight' },
      bounds: { start: node.offsetTop, end: node.offsetTop + node.offsetHeight }
    } : {
      page: 'pageX',
      offset: 'offsetWidth',
      edge: 'offsetLeft',
      auto: { max: 'maxHeight', min: 'minHeight' },
      style: { max: 'maxWidth', min: 'minWidth' },
      bounds: { start: node.offsetLeft, end: node.offsetLeft + node.offsetWidth }
    };
    props.parentSize = node[props.offset];
    return props;
  }

  function setPercents(node, props){
    node.xtag.panels = xtag.queryChildren(node, '*:not([splitter])').map(function(el){
      setMinMax(el, props, el[props.offset]);
      el.style[props.auto.max] = 'none';
      el.style[props.auto.min] = 'auto';
      return el;
    });
  }

  function setMinMax(panel, props, value){
    panel.style[props.style.max] = panel.style[props.style.min] = (value  / props.parentSize) * 100 + '%';
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
        attribute: { def: 'row' },
        set: function(direction){
          setPercents(this, getProps(this));
        }
      }
    }
  });

})();
