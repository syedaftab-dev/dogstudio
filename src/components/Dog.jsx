import React, { useEffect }  from 'react'
import { Canvas, useThree } from '@react-three/fiber' // this will contain the 3js file renderer created
import { OrbitControls, useGLTF, useTexture, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

export const Dog = () => {

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
  const [normalMap, sampleMatCap] = useTexture(["/dog_normals.jpg", "/matcap/mat-2.png"]).map((texture)=>{
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  });
  
  const dogMaterial = new THREE.MeshMatcapMaterial({
    normalMap: normalMap,
    matcap: sampleMatCap
  });
  
  // hamare pass dog wale model main 108 objects,aur traverse har object ke liye ek baar chalega
  model.scene.traverse((child) => {
    if (child.name.includes("DOG")) {
      child.material = dogMaterial;
    }
  })

  return (
    <>
      {/* will display the model */}
      <primitive object={model.scene} position={[0.25, -0.55, 0]} rotation={[0, Math.PI / 3.9, 0]} />
      <directionalLight intensity={10} position={[0, 0, 5]} color={0xFFFFFF} />
      <OrbitControls />
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

