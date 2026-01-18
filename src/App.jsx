import './App.css'
import { Dog } from './components/Dog'
import { Canvas } from '@react-three/fiber'

function App() {  
  return (
    <>
      <main>
        <Canvas style={{height:"100vh",
          width:"100vw",
          position:"fixed",
          top:0,
          left:0,
          zIndex:1,
          backgroundImage:"url(/background-m.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover"
        }}>
          <Dog />
        </Canvas>
        <section id='section-1'></section>
        <section id='section-2'></section>
        <section id='section-3'></section>
      </main>
    </>
  )
}

export default App
