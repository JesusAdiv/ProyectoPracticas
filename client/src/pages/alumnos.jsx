import React, { useContext, useEffect, useState } from "react";
import { NavContext } from "../layouts/layoutProfesor";
import * as XLSX from 'xlsx';
import Table from "../components/table";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { obtenerListaAlumnos, crearListaInscripcion } from "../services/inscripcion.api"
import { getAllAlumnos, createAlumno } from "../services/alumnos.api";
import { claseContext } from "../layouts/layoutProfesor";



export default function Alumnos() {

    const { dataClase } = useContext(claseContext)
    const nrc = dataClase.nrc
    console.log("NRC: "+nrc)
    //Estados
    const [mostrarTablas, setMostrarTablas] = useState(false);
    const { showNav } = useContext(NavContext);
    const [datosImportados, setDatosImportados] = useState([]); 
    const [matriculas, setMatriculas] = useState([]); 

    
    useEffect(() => {
        async function cargaralumnos() {
            try {
                const data = await obtenerListaAlumnos(nrc); // Espera a que se resuelva la promesa y obtén los datos
                setDatosImportados(data); // Asigna los datos al estado
            } catch (error) {
                console.error('Error al cargar los alumnos:', error);
            }
        }
        cargaralumnos();
        showNav();
    }, [mostrarTablas])


    const detallesAlumnos = datosImportados.map(item => {
        const { matricula, nombre, apellidos, correo } = item.alumno_detail;
        return { matricula, nombre, apellidos, correo };
    });

    //Modulo de importación
    const [archivoExcel, setArchivoExcel] = useState(null);
    const [alumnos, setAlumnos] = useState(null);


    //
    // ----------------------------------------------------
    // --- Estados de la variable 'resultadoExtraccion' ---
    // ----------------------------------------------------
    //
    // 0 => Indica que la extraccion se realizo correctamente
    //
    // 1 => Indica que el archivo esta vacio
    //
    // 2 => Indica que el Excel tiene una estructura interna invalida.
    //
    // 3 => Indica que se ha seleccionado un archivo con un tipo diferente a Excel
    //
    // 4 => Indica que se intentando comenzar con el proceso de lectura del Excel sin tener algun archivo seleccionado.
    //
    const [resultadoExtraccion, setResultadoExtraccion] = useState(-1);

    // Esta variable contiene los mensajes que aparecen en cada uno de los posibles escenarios identificados hasta el momento.
    const mensajesImportacionExcel = ["¡Se han importado los datos del Excel exitosamente!",
        "¡¡¡El archivo Excel esta vacio!!!",
        "¡¡¡La estructura del documento no es valida!!!",
        "¡¡¡El tipo de archivo no es valido!!!",
        "¡Seleccione primero un archivo!",
    ];

    //
    // ---------------------------------------------------------------------------------
    //  Esta funcion detecta cuando se ha seleccionado un archivo mediante el formulario
    // ---------------------------------------------------------------------------------
    //
    const manejarArchivo = (e) => {
        let archivoSeleccionado = e.target.files[0];

        if (archivoSeleccionado) {
            let tipoArchivo = archivoSeleccionado.type;
            console.log(tipoArchivo);
            if (tipoArchivo === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") { // Validar que sea un archivo PDF
                let leerArchivo = new FileReader();
                leerArchivo.readAsArrayBuffer(archivoSeleccionado);
                leerArchivo.onload = (e) => {
                    setArchivoExcel(e.target.result);
                };
            }
            else {
                setResultadoExtraccion(3);
                toast(mensajesImportacionExcel[resultadoExtraccion])
            }

        }
    }

    //
    // ------------------------------------------------------------------------------------------------------------
    //  Funcion que permite obtener el nombre y los apellidos de los alumnos dentro del String extraido del Excel.
    // ------------------------------------------------------------------------------------------------------------
    //
    const procesarNombreCompleto = (nombreAlumno) => {
        let auxiliarNombreAlumno = nombreAlumno.split(","); //Se divide el String en 2 partes, tomando como referencia el simbolo ',' para la division.
        let nombre = auxiliarNombreAlumno[1].trim(); // Se obtiene el nombre del alumno, borrando a su vez los espacios que puedan existir al principio y al final del nombre.
        let apellidos = auxiliarNombreAlumno[0]; // Se obtienen los apellidos del alumno
        return { nombre, apellidos }; //Se regresa el nombre y apellidos del alumno.
    }

    //
    // ------------------------------------------------------------------------------------------------------------
    //  Esta funcion permite extraer los correos de los alumnos que estan dentro de un mismo String inicialmente.
    // ------------------------------------------------------------------------------------------------------------
    //
    const obtenerCorreos = (correos) => {
        const contenidoBuscado = /\w+\.\w+@alumno.buap.mx /g; //Patron que se utilizara para buscar los correos dentro del String.
        let listaCorreos = correos.match(contenidoBuscado); // Se buscan todos aquellos elementos dentro del String que cumplan con el patron indicado,
        // obteniendo como resultado un arreglo con todos los correos.
        return listaCorreos; //Se regresa el arreglo con todos los correos.
    }

    //
    // ---------------------------------------------------------------------------------------------------------
    //  Esta funcion permite crear un arreglo de objetos con los datos que se almacenaran en la base de datos.
    // ---------------------------------------------------------------------------------------------------------
    //
    const crearJSON_Alumnos = (datosAlumnos, listaCorreos) => {
        let listaAlumnos;
        //Se recorre el arreglo con los datos extraidos del Excel, con el proposito de obtener aquellos datos
        //que se enviaran a la API.
        listaAlumnos = datosAlumnos.map((alumno, indice) => {
            let { nombre, apellidos } = procesarNombreCompleto(alumno["Nombre de Alumno"]); //Se procesa el nombre completo de uno de los alumnos, obteniendo su nombre y apellido.
            let registroAlumno = { //Estructura que contiene los campos definidos en el modelo de la base de datos para Alumno.
                "matricula": alumno.ID,
                "nombre": nombre,
                "apellidos": apellidos,
                "correo": listaCorreos[indice],
            };
            return registroAlumno; //Se agrega el objeto generado al arreglo llamado "listaAlumnos";
        });
        return listaAlumnos; //Se retorna el arreglo con los datos de los alumnos.
    }

    //
    // -----------------------------------------------------------------------------
    // Funcion la cual permite validar si la estructura interna del Excel es valida.
    // ------------------------------------------------------------------------------
    //
    //  ---------------
    //  ---Variables---
    //  ---------------
    //
    //  -------------------------------------------------------------------
    //   existeNombre, existeMatricula, existeCorreo, esValido -> Booleano
    //  -------------------------------------------------------------------
    //
    const validarEstructuraExcel = (contenidoExcel) => {
        const campoNombre = /[A-Z]+\s\w+,\s[A-Z\s\.]+/g; //Patron que se utilizara para verificar si el Excel contiene el campo Nombre.
        const campoMatricula = /\d{9}/g; //Patron que se utilizara para verificar si el Excel contiene el campo Matricula.
        const campoCorreo = /\w+\.\w+@alumno.buap.mx /g; //Patron que se utilizara para verificar si existe el campo Correo.
        let existeNombre = false; //Indica si existe el campo Nombre.
        let existeMatricula = false; //Indica si existe el campo Matricula
        let existeCorreo = false; //Permite conocer si existe el campo Correo dentro del Excel.
        let esValido = false; // Se utilizara para conocer si la estructura del Excel es valida.
        existeNombre = contenidoExcel.search(campoNombre) != -1 ? true : false; //Se busca si existe el campo Nombre.
        existeMatricula = contenidoExcel.search(campoMatricula) != -1 ? true : false; //Se busca si existe el campo Matricula.
        existeCorreo = contenidoExcel.search(campoCorreo) != -1 ? true : false; // Se busca si existe el campo Correo dentro del Excel.

        esValido = existeNombre && existeMatricula && existeCorreo; //Se verifica si existen los 3 campos necesarios para poder leer el Excel
        return esValido;
    }


    //
    // --------------------------------------------------------
    //  Funcion que permite la extraccion de los datos del PDF
    // --------------------------------------------------------
    //
    const leerExcel = async (e) => {
        e.preventDefault();
        if (archivoExcel != null) { //Se verifica si el usuario ha seleccionado el archivo Excel.
            const workbook = await XLSX.read(archivoExcel, { type: 'buffer' }); //Se obtiene la referencia al archivo Excel
            const worksheetName = await workbook.SheetNames[1]; //Se obtiene el nombre de la segunda hoja del Excel, la cual es aquella que contiene los datos de los alumnos.
            const worksheet = await workbook.Sheets[worksheetName]; //Se obtiene la referencia a la segunda hoja de Excel mediante su nombre.
            const excelValido = validarEstructuraExcel(XLSX.utils.sheet_to_txt(worksheet)); //Se verifica si la estructura del Excel es valida.
            if (!excelValido) { //Si el Excel no tiene una estructura valida, entonces se asigna un valor igual 2 al estado llamado "resultadoExtraccion".
                setResultadoExtraccion(2);
                toast.error(mensajesImportacionExcel[resultadoExtraccion])
            }
            else {//Si el Excel tiene una estructura valida, entonces comienza el proceso de extraccion.
                let datosAlumnos = await XLSX.utils.sheet_to_json(worksheet); // Se obtiene un arreglo con cada una de las filas de la segundo hoja del archivo Excel
                datosAlumnos.shift(); //Se elimina el primer elemento del arreglo, debido a que contiene informacion de los encabezados de la tabla.
                let correosAlumnos = datosAlumnos.pop()["Número de"]; //Se extrae el ultimo elemento del arreglo, el cual contiene los correos de los estudiantes.
                const listaCorreos = obtenerCorreos(correosAlumnos).map((correo) => correo.trim()); //Se procesa el String con los correos, obteniendo una arreglo con los correos de los alumnos.
                const listaAlumnos = crearJSON_Alumnos(datosAlumnos, listaCorreos); //Se procesa el arreglo con los datos de los alumnos, obteniendo otro arreglo con los datos mas relevantes de los alumnos
                console.log(listaAlumnos);
                setAlumnos(listaAlumnos); //Se guarda el arreglo obtenido en el estado "listaAlumnos";
                setResultadoExtraccion(0); //Se indica que el proceso de extraccion se realizo correctamente.
                toast.success("¡Se han extraido los datos del Excel exitosamente!")
                setMostrarTablas(true)
            }
        }
        else { //Si el usuario aun no ha seleccionado algun archivo, se asignara un valor igual a 4 al estado "resultadoExtraccion".
            setResultadoExtraccion(4);
            toast.error(mensajesImportacionExcel[resultadoExtraccion])
        }

    }

    const registrarAlumnos = async () => {
        let alumnosBD = await getAllAlumnos();
        let matriculasBD = alumnosBD.data.map( (alumno) => alumno.matricula);
        let alumnosNoEncontrados = alumnos.filter( (alumno) => !matriculasBD.includes(alumno.matricula) ) 
        let promesas = alumnosNoEncontrados.map(alumno => {
            return createAlumno(alumno);
        });
        return await Promise.all(promesas);
    }

    const registrarInscripcion = async () => {
        try {
             let respuestaAlumno = await registrarAlumnos()
             console.log(respuestaAlumno)
          //  {
            //console.log(res)
            let listaMatriculas = alumnos.map( (alumno) => (alumno.matricula));
            setMatriculas(listaMatriculas);
            console.log(listaMatriculas);
            console.log("Creacion de las inscripciones");

            let responses = await crearListaInscripcion(listaMatriculas, nrc);
            responses.forEach(response => {
                console.log('Inscripción registrada:', response.data);
            });
            console.log("Finaliza la creacion de inscripciones");
            setMostrarTablas(false);
            //setDatosImportados(alumnos);
            toast.success("¡Se han registrado a los alumnos exitosamente!")
          //  }
        // );
        } catch (error) {
            console.error('Error al registrar la inscripción:', error);
        }
    };
    
    

    const columns = [
        { header: 'Matricula', accessorKey: 'matricula' },
        { header: 'Nombre', accessorKey: 'nombre' },
        { header: 'Apellido', accessorKey: 'apellidos' },
        { header: 'Correo', accessorKey: 'correo' }
    ]



    return (
        <div className="flex flex-col items-center justify-start min-h-full">
            {(!mostrarTablas && datosImportados.length === 0) &&  (
                <div className="flex flex-col items-center justify-center">
                    <h1 className="text-center text-3xl font-bold mb-8">Parece que aun no ha importado a los alumnos de esta clase</h1>
                    <form className="mb-4">
                        <label htmlFor="cargar">Seleccione su archivo: </label>

                        <input type="file" accept=".xlsx" id="cargar" name="archivo" onChange={manejarArchivo} />
                    </form>
                    <Button
                        radius="large"
              className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-2 mr-3 mb-9 font-bold text-base"
                        onClick={leerExcel}
                    >
                        Extraer datos
                    </Button>
                </div>
            )}
            {(mostrarTablas && datosImportados.length === 0) && (
            <>
                <div className="w-full mb-12">
                <h2 className="text-3xl font-semibold ml-2 mt-5 mb-6">Datos extraidos del archivo</h2>
                    <Table data={alumnos} columns={columns} esVistaExtraccion={true}></Table>
                    <div className="mt-3">
                     <span className="text-xl font-semibold  ml-2">Numero de alumnos:</span>
                     <span className="text-xl "> {alumnos.length}</span>
                    </div>
                    <div className="flex justify-end">
                    <Button
                        radius="large"
                        className="bg-gradient-to-tr from-primary-100 to-primary-200 text-white px-6 py-6 mt-2 mr-3 mb-11 font-bold text-base"
                        onClick={registrarInscripcion}
                    >
                        Registrar alumnos
                    </Button>
                    </div>

                </div>
            </>
            )}
            {datosImportados.length !== 0 &&(

                <div className="w-full">
       <h2 className="text-3xl font-semibold ml-3 mt-5">Lista de Alumnos</h2>

                    <Table data={detallesAlumnos} columns={columns} esVistaExtraccion={false}></Table>
                </div>
            )}
        </div>
    )
}