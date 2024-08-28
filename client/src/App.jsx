import { BrowserRouter, Route, Routes } from "react-router-dom"


//import layout
import Layout from "./layouts/layout"
import LayoutProfesor from "./layouts/layoutProfesor";
import LayoutAlumno from "./layouts/layoutAlumno";

//Import auxiliares

import {ProtectedRouteAdmin} from "./ProtectedRouteAdmin";
import {ProtectedRouteProfesor} from "./ProtectedRouteProfesor";
import {ProtectedRouteAlumno} from "./ProtectedRouteAlumno";

// --------------------
// --- Import pages ---
// --------------------

//Administrador
import Home from "./pages/homepage";
import ClasesAdministrador from "./pages/clasesAdministrador";
import Profesores from "./pages/profesores";

//Profesor
import Error404 from "./pages/error404";
import Historico from "./pages/historico"
import QrCode from "./pages/qrCode"
import Alumnos from "./pages/alumnos";
import Login from "./pages/login";
import HomeProfesor from "./pages/homepageProfesor";
import Criterios from "./pages/criterios";
import Entregas from "./pages/entregas";
import RegistroCalificaciones from "./pages/registroCalificaciones";
import Asistencias from "./pages/asistencias";

//Alumno
import HomeAlumno from "./pages/homepageAlumno";
import CalificacionesAlumno from "./pages/calificacionesAlumno";
import AsistenciasAlumno from "./pages/asistenciasAlumno";

export default function App() {
  return (
   <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login/>}/>
      
      <Route element={<ProtectedRouteAdmin/>}>
       <Route path="/admin" element={<Layout/>}>
        <Route index element ={<Home/>}/>
        <Route path="clases" element={<ClasesAdministrador/>}/>
        <Route path="profesores" element={<Profesores/>}/>
       </Route>
      </Route>

      <Route element={<ProtectedRouteProfesor/>}>
       <Route path="/profesor" element={<LayoutProfesor/>}>
        <Route index element ={<HomeProfesor email=""/>}/>
        <Route path="historico" element ={<Historico/>}/>
        <Route path="qr_code" element ={<QrCode/>}/>
        <Route path="alumnos" element={<Alumnos/>}/>
        <Route path="asistencias" element={<Asistencias/>}/>
        <Route path="entregas" element={<Entregas/>}>
         <Route path="reporte" element={<RegistroCalificaciones/>}/> 
        </Route>
        <Route path="criterios" element={<Criterios/>}/>
       </Route>
      </Route>

      <Route element={<ProtectedRouteAlumno/>}>
       <Route path="/alumno" element={<LayoutAlumno/>}>
        <Route index element={<HomeAlumno/>}/>
        <Route path="calificaciones" element={<CalificacionesAlumno/>} />
        <Route path="asistencias" element={<AsistenciasAlumno/>}/>
       </Route>
      </Route>

      <Route path="*" element={<Error404/>} />
      <Route path="/login" element={<Login/>}/>
    </Routes>
   </BrowserRouter> 
  )
}
