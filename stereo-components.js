/* global AFRAME */

// let stereoHasLoaded = true; //global flag

if (typeof AFRAME === "undefined") {
    throw new Error(
        "Component attempted to register before AFRAME was available."
    );
}

/**
 * This component should be attached to an <a-camera> entity. It hunts for a
 * THREE.PerspectiveCamera and modifies the layers it can see.
 *
 * - If 'eye' is 'left': the first layer is enabled i.e. camera.layers.enable(1)
 * - If 'eye' is 'right': the second layer is enabled i.e. camera.layers.enable(2)
 * - If 'eye' is 'both': both layers are enabled
 *
 * Why is this useful? In VR, sometimes you want to show things to one eye but
 * not the other (stereo panoramas for instance). This can be done by restricting
 * an Object3D to either layer 1 (visible to the left eye) or layer 2 (visible
 * to the right eye) [0]. Nothing wrong with this except that outside of VR the
 * camera can only see layer 0. By enabling layer 1 and/or 2, this component
 * ensures objects are visible outside of VR.
 *
 * This component is based on oscarmarinmiro's stereo component [1].
 *
 * ---
 *  [0] - This is done by THREE.js's WebXRManager
 *   https://github.com/mrdoob/three.js/blob/0950e5b6e8bceb520c154f45b5c240af45f0ed11/src/renderers/webxr/WebXRManager.js#L41
 *  [1] - https://github.com/oscarmarinmiro/aframe-stereo-component
 */
AFRAME.registerComponent("stereocam", {
    schema: {
        eye: { type: "string", default: "left" },
    },

    update: function (oldData) {
        const data = this.data;
        const el = this.el;

        const camera = el.object3D.children.find(
            (c) => c.type === "PerspectiveCamera"
        );

        if (!camera) {
            console.warn("stereocam could not find PerspectiveCamera");
            return;
        }

        if (data.eye === "both") {
            camera.layers.enable(1);
            camera.layers.enable(2);
        } else {
            camera.layers.enable(data.eye === "left" ? 1 : 2);
        }
    },
});


//   generates stereoscopic sky (currently just with spheres) 
//   To-Do add cubemaps 6/6/2023
AFRAME.registerComponent('stereo-sky', {
    schema: {
        shape: { type: 'string', default: 'sphere'},
        src: { type: 'string' }
    },


    init: function () {

        let el = this.el
        let data = this.data;
        let src = this.data.src.replaceAll(' ', '').split(",");

        if (src.length != 2) {
            console.log("requires an img source for each eye")
        } else if (stereoHasLoaded){

            createsStereoSphericalProjects(src[0], src[1])
        } else{
            document.querySelector("a-scene").addEventListener("stereocam-loaded",()=>{
                createsStereoSphericalProjects(src[0], src[1])

            })
        }

        function createsStereoSphericalProjects(srcLeft, srcRight) {
            
            console.log("creating...", srcLeft, srcRight )
            let l = srcLeft.replaceAll(' ', '');
            let leftSky = document.createElement("a-sky")
            leftSky.setAttribute("src", srcLeft)
            
            // leftSky.onload = function(){
            //     leftSky.getObject3D("mesh").layers.set(1) // layer 1 is left eye, layer 2 is right 

            // }


            let rightSky = document.createElement("a-sky")
            rightSky.setAttribute("src", srcRight)
            // rightSky.onload = function(){
            //     rightSky.getObject3D("mesh").layers.set(2)
            // }

            el.append(rightSky)
            el.append(leftSky)

            //create sky
            //settings is src1
            //set object3d.mesh to layer1
            //add to this object


            //create sky
            // setting src2
            //set object3d.mesh to layer2
            //add to this object

        }



    },






});
