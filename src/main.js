(function(){

  function startDrag(node, splitter, event){

    node.setAttribute('dragging', '');
    splitter.setAttribute('dragging', '');
    node.xtag.splitter = splitter;

    var props = getProps(node);
    var lastCoord = event[props.page] - node[props.edge];
    var next = splitter.nextElementSibling, next = !next.hasAttribute('splitter') && next;
    var previous = splitter.previousElementSibling, previous = !previous.hasAttribute('splitter') && previous;
    var splitterSize = splitter[props.size];
    var startingTotal = next[props.size] + previous[props.size] - splitterSize;

    setPercents(node, props);

    node.xtag.drag = xtag.addEvent(node, 'move', function(e){
      var delta = e[props.page] - node[props.edge] - lastCoord;
      var nextSize = next[props.size];
      var prevSize = previous[props.size];
      var nextMod = nextSize - delta;
      var prevMod = prevSize + delta;

      if (delta > 0) {
        if (nextSize > 0) {
          if (nextMod <= 0 || prevMod >= startingTotal || prevMod > startingTotal || nextMod > startingTotal) {
            prevMod = startingTotal;
            nextMod = splitterSize;
          }
          setMinMax(next, props, nextMod);
          setMinMax(previous, props, prevMod);
        }
      }

      else if (delta < 0) {
        if (prevSize > 0) {
          if (prevMod <= 0 || nextMod >= startingTotal || prevMod > startingTotal || nextMod > startingTotal) {
            nextMod = startingTotal;
            prevMod = splitterSize;
          }
          setMinMax(next, props, nextMod);
          setMinMax(previous, props, prevMod);
        }
      }

      lastCoord = e[props.page] - node[props.edge];
    });
  }

  function getProps(node){
    var props = node.xtag.props = (node.direction == 'column') ? {
      page: 'pageY',
      size: 'clientHeight',
      edge: 'clientTop',
      auto: { max: 'maxWidth', min: 'minWidth' },
      style: { max: 'maxHeight', min: 'minHeight' }
    } : {
      page: 'pageX',
      size: 'clientWidth',
      edge: 'clientLeft',
      auto: { max: 'maxHeight', min: 'minHeight' },
      style: { max: 'maxWidth', min: 'minWidth' }
    };
    props.parentSize = node[props.size];
    return props;
  }

  function setPercents(node, props){
    node.xtag.panels = xtag.queryChildren(node, '*:not([splitter])').map(function(el){
      setMinMax(el, props, el[props.size]);
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
      node.removeAttribute('dragging');
      node.xtag.splitter.removeAttribute('dragging');
      node.xtag.splitter = null;
      node.xtag.drag = null;
    }
  }

  xtag.addEvent(window, 'tapend', function(e){
    xtag.query(document, 'x-splitbox[dragging]').forEach(stopDrag);
  })

  xtag.register('x-splitbox', {
    events: {
      'tapstart:delegate(x-splitbox > [splitter])': function(e){
        startDrag(e.currentTarget, this, e);
      },
      dragstart: function(e){
        if (this.hasAttribute('dragging')) {
          e.preventDefault();
          return false;
        }
      },
      contextmemu: function(e){
        e.preventDefault();
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
