// WAVE MODEL

function Wave(html, index, controller) {
  this._i  = index
  this._num= index + 1
  this.html= html
  this.controller = controller
  this.nav = this.findNavItem()
  if(this.nav) this.bindNavItem()
}
Wave.prototype.findNavItem = function() {
  return document.getElementsByClassName('nav-item-for-wave-' + this._num)[0]
}
Wave.prototype.activateNav = function() {
  if ( this.nav ) this.nav.className += ' wave-active'  
}
Wave.prototype.disableNav = function() {
  if ( this.nav ) this.nav.className = this.nav.className.replace(' wave-active','')
}
Wave.prototype.bindNavItem = function() {
  var self = this
  this.nav.addEventListener('click', function(e) { self.onNavClick.call(self, e) } )
}
Wave.prototype.onNavClick = function(e) {
  this.controller.fade(this._num)
}

// WAVECONTROLLER MODEL

function WaveController(id) {
  this.id       =id
  this.html     =document.getElementById(id)
  this._wave    =0
  this._frozen  =false
  this._prefix  =this.findPrefix()
  this.view     = new WaveView(this)
  this.eventHandler = new EventController(this)
}
WaveController.prototype.findPrefix = function() {
  var styles = window.getComputedStyle(document.documentElement, '')
  var prefix = (Array.prototype.slice
                     .call(styles)
                     .join('')
                     .match(/-(moz|webkit|ms)-/))[1]
  return '-'+prefix+'-'
}
WaveController.prototype.resize = function() {
  this.view.resize()
  this.slide(0)
}
WaveController.prototype.slide = function(direction) {
  if( this.goingOutOfBounds(direction) || this._frozen ) return
  this.freeze()
  var self     = this,
      distance = self.nextWave(direction),
      styles   = self.slideStyles(distance)
  self.view.update(styles)
}
WaveController.prototype.fade = function(wave) {
  if( this.isOutOfBounds(wave) || this._frozen ) return
  this.freeze()
  var self          = this,
      distance      = self.skipTo(wave),
      fadeOutStyles = self.fadeOutStyles(),
      fadeInStyles  = self.fadeInStyles(distance)
  self.view.update(fadeOutStyles, null, function() {
    setTimeout(function() { self.view.update(fadeInStyles) }, 700)
  })
}
WaveController.prototype.freeze = function() {
  this._frozen = true
  this.thaw()
}
WaveController.prototype.thaw = function() {
  var self = this
  setTimeout(function() {
    self._frozen = false
  }, 1200)
}
WaveController.prototype.nextWave = function(direction) {
  this._wave = this._wave + direction
  return this._wave*this.view._height
}
WaveController.prototype.skipTo = function(wave) {
  this._wave = -wave + 1
  return this._wave*this.view._height
}
WaveController.prototype.goingOutOfBounds = function(direction) {
  var newWave = this._wave + direction
  if( newWave <= -this.view._numWaves || newWave >= 0 ) return true
  return false
}
WaveController.prototype.isOutOfBounds = function(wave) {
  if( wave > this.view._numWaves || wave < 0 ) return true
  return false
}
WaveController.prototype.slideStyles = function(distance) {
  var p = this._prefix,
      o = {} 
  o[p+'transform'] = 'translate3d(0, '+distance+'px, 0)'
  o[p+'transition']= p+'transform 1.25s ease .1s'
  o['transition']  = p+'transform 1.25s ease .1s'
  return o
}
WaveController.prototype.fadeOutStyles = function() {
  var p = this._prefix,
      o = {}
  o['opacity'] = 0
  o[p+'transition'] = p+'opacity .6s ease .1s'
  o['transition']   = p+'opacity .6s ease .1s'
  return o
}
WaveController.prototype.fadeInStyles = function(distance) {
  var p = this._prefix,
      o = {}
  o['opacity'] = 1
  o[p+'transform'] = 'translate3d(0, '+distance+'px, 0)'
  o[p+'transition'] = p+'opacity .6s ease .1s'
  o['transition']   = p+'opacity .6s ease .1s'
  return o
}

// WAVE VIEW

function WaveView(controller) {
  this.controller = controller 
  this.parent     = controller.html
  this.waves      = this.getWaves()
  this._numWaves  = this.waves.length
  this.disableScrolling()
  this.resize()
}
WaveView.prototype.getWaves = function() {
  var children = this.parent.children,
      waves    = []
  for (var i=0; i < children.length; i++) { 
    var wave = new Wave( children[i], i, this.controller )
    waves.push( wave )
  }
  return waves
}
WaveView.prototype.resize = function() {
  this.setDimensions() 
  var h = this._numWaves * this._height,
      w = this._width
  this.update({'height': h+'px', 'width': w+'px'})
  this.updateWaves({'height': this._height+'px', 'width': '100%'}) 
}
WaveView.prototype.setDimensions = function() {
  var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0]
  this._width = w.innerWidth || e.clientWidth || g.clientWidth
  this._height= w.innerHeight|| e.clientHeight|| g.clientHeight
}
WaveView.prototype.update = function(style, element, callback) {
  var el = element || this.parent
  this.updateNavs()
  this.updateElement(style, el)
  if(callback) callback()
}
WaveView.prototype.updateNavs = function() {
  var waves = this.waves
  for(var i in this.waves) {
    var wave = waves[i]
    wave.disableNav()
    if(wave._i === -this.controller._wave) wave.activateNav()
  }
}
WaveView.prototype.updateElement = function(style, el) {
  for(var property in style) el.style[property] = style[property]
}
WaveView.prototype.updateWaves = function(style) {
  for(var i=0; i < this._numWaves; i++) {
    this.updateElement(style, this.waves[i].html) 
  }
}
WaveView.prototype.disableScrolling = function() {
  document.body.style['overflow'] = 'hidden'
}

// EVENT CONTROLLER

function EventController(controller) {
  this.controller = controller
  this.bindEvents()
}
EventController.prototype.bindEvents = function() {
  var self = this
  window.addEventListener('resize', function(e) { self.resize.call(self, e) } )
  document.addEventListener('mousewheel', function(e) { self.mouseWheel.call(self, e) } )
  document.addEventListener('DOMMouseScroll', function(e) { self.mouseWheel.call(self, e) } )
  document.addEventListener('keydown', function(e) { self.keydown.call(self, e) } )
  document.addEventListener('touchstart', function(e) { self.touchStart.call(self, e) } )
  document.addEventListener('touchmove', function(e) { self.touchMove.call(self, e) } )
  document.addEventListener('touchend', function(e) { self.touchEnd.call(self, e) } )
}
EventController.prototype.resize = function(e) {
  this.controller.resize()
}
EventController.prototype.mouseWheel = function(e) {
  if (this.controller._frozen) return
  var deltaY      = e.wheelDeltaY || -1 * e.deltaY,
      direction   = deltaY > 0 ? 1 : -1
  this.controller.slide(direction)
}
EventController.prototype.keydown = function(e) { 
  if (this.controller._frozen) return
  var key = e.charCode || e.keyCode
  if (key === 38 || key === 40) {
    var direction = key === 40 ? -1 : 1
    this.controller.slide(direction) 
  }
  if (key >= 49 && key <= 57 ) {
    var newWave = String.fromCharCode(key)
    this.controller.fade(newWave)
  }
}
EventController.prototype.touchStart = function(e) {
  e.preventDefault()
  if (this.controller._frozen) return
  this._touchY = e.touches[0].screenY
}
EventController.prototype.touchMove = function(e) {
  if (this.controller._frozen) return
  var touchY       = e.touches[0].screenY,
      deltaY       = touchY - this._touchY,
      direction    = deltaY > 0 ? 1 : -1
  this._touchY = touchY
  this.controller.slide(direction)
}
EventController.prototype.touchEnd = function(e) {
  this._touchY = null
}
