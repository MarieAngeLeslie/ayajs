import { Line } from "./entities/line.js";
import { _Register } from "./register.js";
import { _uuid } from "./entities/uuid.js";
import { Link } from "./entities/link.js";


function nativeEvents() {
  var id;
  var cp;
  var dx, dy;
  var state = "";
  var deltaX, deltaY;
  var line = "";
  var source;
  var lk;
  var pos;

  return {
    mouseDownCb: function mousedowncb(e) {

      dx = e.offsetX;
      dy = e.offsetY;

      id = e.srcElement.id;

      cp = _Register.find(id);

      // Only the points have the ref property to refer to form that instantiates them.
      // In source we have the component instance created.
      if (id != "svg")
        source = cp != undefined && cp.ref != undefined ? _Register.find(cp.ref) : cp;

      if(cp.form != undefined)
        lk = _Register.getAllLinksByComponent(cp);


      // The displacement of the form is triggered when the mousedown is done on the form, and neither on the point nor the svg.
      if ((cp != undefined && cp.ref == undefined) )
          state = "moving";
      else {
        // Resizing is triggered when the mousedown takes place on one of the summits.
        if (  (source.form.vertex != undefined) && (pos = source.form.vertex.indexOf(cp)) >= 0) {
          state = "resizing";
          dx = e.offsetX;
          dy = e.offsetY;

          // component determination 
          cp = _Register.find(cp.ref);
          lk = _Register.getAllLinksByComponent(cp);
        }
        else {
          /**
           * If the mousedown was not done on the svg, neither on a top nor on the form, then it was certainly done on a connection point.
           * In this case, we start tracing a link.
           */
          state = "drawing_link";
          id = _uuid.generate();
          if (cp != source) {
            line = new Line(id, cp.x, cp.y);
            line.draw(svg);
          }
        }
      }
    },
    mouseMoveCb: function movecb(e) {

      if (state == "moving") {

        deltaX = e.offsetX - dx;
        deltaY = e.offsetY - dy;

        dx = e.offsetX;
        dy = e.offsetY;

        // Ensure cp is a component
        var src, sink;
        if(cp.form != undefined){
          lk.map((link) => {
            cp.form.c_points.map( (point) => {
              if(point == link.source)
                src = point;
              else if(point == link.destination)
                sink = point;
            })
            if(src){
              link.line.x += deltaX;
              link.line.y += deltaY;
              link.line.redraw();
            }
            else {
              link.line.dest_x += deltaX;
              link.line.dest_y += deltaY;
              link.line.redraw();
            }
          });

          cp.form.shift(deltaX, deltaY);
          cp.form.redraw();

          lk.map( (link) => {
            link.redraw();
          });

        }
      }
      else if (state == "drawing_link") {

        line.dest_x = e.clientX;
        line.dest_y = e.clientY;
        line.redraw();
      }
      else if (state == "resizing") {
          deltaX = e.offsetX - dx;
          deltaY = e.offsetY - dy;

          dx = e.offsetX;
          dy = e.offsetY;

          source.form.resize(pos, deltaX, deltaY);
          source.form.redraw();

          lk.map( (link ) => {
            link.redraw();
          });
      }
    },
    mouseUpCb: function mouseupcb(e) {
      if (state == "drawing_link") {
        id = e.srcElement.id;
        var pnt = _Register.find(id);


        if (pnt != undefined && pnt.ref != undefined) {
          line.dest_x = pnt.x;
          line.dest_y = pnt.y;

          new Link(cp, pnt, line).redraw();
        }
        else if (id == "svg" || pnt.ref == undefined) {
          var ref = document.getElementById(line.uuid);
          ref.remove();
        }
      }
      state = "";
    }
}
}
var events = nativeEvents();

export { events };