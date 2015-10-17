(function(){

  function startDrag(node, splitter, event){

    node.setAttribute('x-splitter-dragging', '');

    var props = getProps(node);
    var lastCoord = event[props.page] - node[props.edge];
    var next = splitter.nextElementSibling, next = !next.hasAttribute('splitter') && next;
    var previous = splitter.previousElementSibling, previous = !previous.hasAttribute('splitter') && previous;
    var startingTotal = next[props.offset] + previous[props.offset];

    setPercents(node, props);

    node.xtag.drag = xtag.addEvent(node, 'move', function(e){
      var delta = e[props.page] - node[props.edge] - lastCoord;
      var nextOffset = next[props.offset];
      var prevOffset = previous[props.offset];
      var nextSize = nextOffset - delta;
      var prevSize = prevOffset + delta;

      if (delta > 0) {
        if (nextOffset > 0) {
          if (nextSize <= 0 || prevSize >= startingTotal) {
            prevSize = startingTotal;
            nextSize = 0;
          }
          setMinMax(next, props, nextSize);
          setMinMax(previous, props, prevSize);
        }
      }

      else if (delta < 0) {
        if (prevOffset > 0) {
          if (nextSize <= 0 || nextSize >= startingTotal) {
            nextSize = startingTotal;
            prevSize = 0;
          }
          setMinMax(next, props, nextSize);
          setMinMax(previous, props, prevSize);
        }
      }

      lastCoord = e[props.page] - node[props.edge];
    });
  }

  function getProps(node){
    var props = node.xtag.props = (node.direction == 'column') ? {
      page: 'pageY',
      offset: 'offsetHeight',
      edge: 'offsetTop',
      auto: { max: 'maxWidth', min: 'minWidth' },
      style: { max: 'maxHeight', min: 'minHeight' }
    } : {
      page: 'pageX',
      offset: 'offsetWidth',
      edge: 'offsetLeft',
      auto: { max: 'maxHeight', min: 'minHeight' },
      style: { max: 'maxWidth', min: 'minWidth' }
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
