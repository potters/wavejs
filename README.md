wavejs
======

This is a javascript library that will make it easy to do paged parallax scrolling.  It is very much like on the http://apple.com/iphone-5c/.

Setup

Download and require the wave.js file.  Then, after the DOM has loaded, create a new wave controller passing it the id of a container.  It will then create 'pages' out of all the direct children of the element whose id was passed.

for example:

```
<div id="parent">
  <section></section>
  <section></section>
  <section></section>
</div>

<script>
  var WC = new WaveController('parent')
</script>
```

This will create 3 pages.

To add a nav bar, simply label the nav items with the class "nav-item-for-wave-#", where # is the page that the nav item will correlate to.  When that specified page is active, it will apply a 'wave-active' class to the nav item.

Use 

If setup corrently, it will then respond to scrolling, arrow keys, the nav bar, numeric values 1-9, as well as touch.  The elements that represent a page may be positioned relatively so that any children elements can be positioned absolutely.  
