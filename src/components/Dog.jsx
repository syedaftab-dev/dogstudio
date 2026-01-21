import { useEffect, useRef }  from 'react'
import { useThree } from '@react-three/fiber' // this will contain the 3js file renderer created
import { useGLTF, useTexture, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { gsap } from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'



export const Dog = () => {

  // animating the model on page scrolling

  // 1. register plugins
  gsap.registerPlugin(useGSAP());
  gsap.registerPlugin(ScrollTrigger);


  // this will load the model
  const model = useGLTF("/models/dog.drc.glb") // path is relative to the public folder

  useThree(({ camera, scene, gl }) => {
    console.log(camera.position);
    // the model was to far from camera so we moved it closer
    camera.position.z = 0.55;
    // this will make the model look better,3js will make model color fhike by default
    gl.toneMapping = THREE.ReinhardToneMapping;
    gl.outputColorSpace = THREE.SRGBColorSpace;
  })

  // animations
  const {actions} = useAnimations(model.animations, model.scene);
  useEffect(()=>{
    actions["Take 001"].play();
  },[actions])

  // normal map and matcap apply on model
  const [normalMap,branchMap, branchNormalMap ] = useTexture(["/dog_normals.jpg","/branches_diffuse.jpg","/branches_normals.jpg"]).map((texture)=>{
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });
  
  // loading matcap materials
  const [mat1,mat2,mat3,mat4,mat5,mat6,mat7,mat8,mat9,mat10,mat11,mat12,mat13,mat14,mat15,mat16,mat17,mat18,mat19,mat20] = (useTexture([
    "./matcap/mat-1.png",
    "./matcap/mat-2.png",
    "./matcap/mat-3.png",
    "./matcap/mat-4.png",
    "./matcap/mat-5.png",
    "./matcap/mat-6.png",
    "./matcap/mat-7.png",
    "./matcap/mat-8.png",
    "./matcap/mat-9.png",
    "./matcap/mat-10.png",
    "./matcap/mat-11.png",
    "./matcap/mat-12.png",
    "./matcap/mat-13.png",
    "./matcap/mat-14.png",
    "./matcap/mat-15.png",
    "./matcap/mat-16.png",
    "./matcap/mat-17.png",
    "./matcap/mat-18.png",
    "./matcap/mat-19.png",
    "./matcap/mat-20.png",
  ])).map(texture => {
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  })


  // for a short time of transition on material we can see on model we have 2 material
  const material = useRef({
    uMatcap1: {value: mat19},
    uMatcap2: {value: mat2},
    uProgress: {value: 1.0 } // percentage to share on model 50% of 0.5 50%-mat1 and 50%-mat2
  })

  // creating materials for dog
  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: mat2
  });
  
  // creating materials for branches
  const branchMaterial = new THREE.MeshMatcapMaterial({
    normalMap: branchNormalMap,
    map: branchMap
  });

  // applying shader when hover
  // function to edit vertex , fragment shader before it render on every frame of objectslll
  function onBeforeCompile(shader){

     shader.uniforms.uMatcapTexture1 = material.current.uMatcap1
        shader.uniforms.uMatcapTexture2 = material.current.uMatcap2
        shader.uniforms.uProgress = material.current.uProgress

        // Store reference to shader uniforms for GSAP animation

        shader.fragmentShader = shader.fragmentShader.replace(
            "void main() {",
            `
        uniform sampler2D uMatcapTexture1;
        uniform sampler2D uMatcapTexture2;
        uniform float uProgress;

        void main() {
        `
        )

        shader.fragmentShader = shader.fragmentShader.replace(
            "vec4 matcapColor = texture2D( matcap, uv );",
            `
          vec4 matcapColor1 = texture2D( uMatcapTexture1, uv );
          vec4 matcapColor2 = texture2D( uMatcapTexture2, uv );
          float transitionFactor  = 0.2;
          
          float progress = smoothstep(uProgress - transitionFactor,uProgress, (vViewPosition.x+vViewPosition.y)*0.5 + 0.5);

          vec4 matcapColor = mix(matcapColor2, matcapColor1, progress );
        `
        )
    }

    dogMaterial.onBeforeCompile = onBeforeCompile;


  // hamare pass dog wale model main 108 objects,aur traverse har object ke liye ek baar chalega
  model.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial;
    }else{
      child.material = branchMaterial;
    }
  })


  const dogModel = useRef(model);

  useGSAP(()=>{
    const tl = gsap.timeline({
      scrollTrigger: {
      trigger: "#section-1",
      endTrigger: "#section-3",
      start: "top top",
      end: "bottom bottom",
      markers: true,
      scrub: true
    }
    })

    tl
    .to(dogModel.current.scene.position,{
      z: "-=0.75",
      y: "+=0.1",
    })
    .to(dogModel.current.scene.rotation,
      {
        x: `+=${Math.PI / 15}`,
      }
    )
    .to(dogModel.current.scene.rotation,{
      y: `-=${Math.PI }`,
    },"third") 
    .to(dogModel.current.scene.position,{
      x: "-=0.6",
      z: "+=0.63",
      y: "-=0.01"
    },"third")
    // third is a tag will both animations works sath main
  },[])

  useEffect(()=>{
    document.querySelector(`.title[img-title="tomorrowland"]`).addEventListener("mouseenter",()=>{
      material.current.uMatcap1.value = mat19;
      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="navy-pier"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat8;

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="msi-chicago"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat9; // loading the mat9 to render

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="phone"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat12;

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="kikk"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat10;

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="kennedy"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat8;

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.title[img-title="opera"]`).addEventListener("mouseenter",()=>{
      
      material.current.uMatcap1.value = mat13;

      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
    document.querySelector(`.titles`).addEventListener("mouseleave",()=>{
      material.current.uMatcap1.value = mat2;
      gsap.to(material.current.uProgress,{
        value: 0.0,
        duration: 0.3,
        onCompile: ()=>{
          material.current.uMatcap2.value=material.current.uMatcap1.value;
          material.current.uProgress.value = 1.0
        }
      })
    })
  },[])

  return (
    <>
      {/* will display the model */}
      <primitive object={model.scene} position={[0.25, -0.55, 0]} rotation={[0, Math.PI / 3.9, 0]} />
      <directionalLight intensity={10} position={[0, 0, 5]} color={0xFFFFFF} />
      {/* <OrbitControls /> */}
    </>
  )
}

// {/* ithne se code se humne camera,light aur ek cube baneye with the help of rect-three/fiber */}
//         <mesh>
//             <meshBasicMaterial color={0x00FF00}/>
//             <boxGeometry args={[1,1,1]}/>
//         </mesh>
//         <OrbitControls />  {/* this will allow us to rotate the camera around the object */}


/*

Materials which can be seen without light
1. MeshBasicMaterial


Normal Map - ek image hothi hai jismain model ke detailing(textures) hothe hai,agr model detailed hoga tho performance kam hothi par normal map se balance kar sakthe hai

*/

