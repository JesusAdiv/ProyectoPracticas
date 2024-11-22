import React, { useContext, useState, useEffect } from 'react';
import { NavContext, claseContext } from '../layouts/layoutProfesor';
import QRScanner from '../components/QRScanner'; // Asegúrate de que la ruta sea correcta

const Asistencias = () => {
  const { showNav } = useContext(NavContext);
  const { dataClase } = useContext(claseContext);
  const [matricula, setMatricula] = useState('');
  const [busqueda, setBusqueda] = useState(''); // Estado para la búsqueda
  const [mensaje, setMensaje] = useState('');
  const [asistencias, setAsistencias] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [nextPage, setNextPage] = useState(null);
  const [prevPage, setPrevPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    showNav();
    fetchAsistencias(currentPage);
  }, [showNav, dataClase, currentPage]);

  const fetchAsistencias = async (page = 1) => {
    const nrc_clase = dataClase.nrc;
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}Asistencia/?materia_nrc=${nrc_clase}&page=${page}`);
      if (response.ok) {
        const result = await response.json();
        const orderedAsistencias = result.results.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setAsistencias(orderedAsistencias);
        setNextPage(result.next);
        setPrevPage(result.previous);
      } else {
        console.error('Error al obtener las asistencias:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  const handleGuardar = async () => {
    const nrc_clase = dataClase.nrc;
    const data = {
      matricula: matricula,
      materia_nrc: nrc_clase
    };

    try {
      const response = await fetch('${import.meta.env.VITE_BACKEND_URL}Asistencia/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        setMensaje('Asistencia registrada correctamente.');
        setIsSuccess(true);
        console.log('Asistencia registrada:', result);
        fetchAsistencias(); // Actualiza la lista de asistencias
      } else {
        const errorData = await response.json();
        const detail = errorData.detail || '';
        setIsSuccess(false);

        if (detail.includes('Invalid pk')) {
          setMensaje('La matrícula no está registrada en el sistema.');
        } else if (detail.includes('no está inscrito en la clase')) {
          setMensaje('El alumno no está inscrito en la clase o no tiene una inscripción activa.');
        } else if (detail.includes('ya ha registrado asistencia hoy')) {
          setMensaje('El alumno ya ha tomado asistencia hoy.');
        } else {
          setMensaje('Ocurrió un error al registrar la asistencia.');
        }
        console.error('Error:', errorData);
      }
    } catch (error) {
      setMensaje('Error al conectar con el servidor.');
      setIsSuccess(false);
      console.error('Error al conectar con el servidor:', error);
    }
  };

  const handleScan = (scannedMatricula) => {
    setMatricula(scannedMatricula);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Función para filtrar asistencias por matrícula
  const filteredAsistencias = asistencias.filter(asistencia =>
    asistencia.matricula.includes(busqueda)
  );

  return (
    <div className="items-center text-center mt-10">
      <h2 className="text-2xl font-bold">Sección de Asistencias</h2>

      <div className="mt-4">
        <label htmlFor="matricula" className="block text-xl font-medium text-white">
          Matrícula:
        </label>
        <input
          type="text"
          id="matricula"
          value={matricula}
          onChange={(e) => setMatricula(e.target.value)}
          className="mt-1 p-2 border border-gray-300 rounded text-black"
          placeholder="Ingresa la matrícula"
        />
      </div>

      <div className="mt-4">
        <button
          onClick={handleGuardar}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
        >
          Registrar Alumno
        </button>
      </div>

      {/* Mostrar el mensaje debajo del botón */}
      {mensaje && (
        <div className={`mt-4 p-2 border border-white rounded w-11/12 sm:w-7/12 md:w-7/12 lg:w-7/12 xl:w-7/12 mx-auto 
          ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
          {mensaje}
        </div>
      )}

      <div className="mt-4 w-11/12 md:w-7/12 lg:w-7/12 mx-auto">
        <QRScanner onScan={handleScan} />
      </div>

      {/* Mostrar la tabla con las asistencias */}
      <div className="mt-10 w-11/12 md:w-7/12 lg:w-7/12 mx-auto">
        <h3 className="text-xl font-bold">Lista de Asistencias</h3>
        <table className="w-full mt-4 border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Matrícula</th>
              <th className="border border-gray-300 p-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filteredAsistencias.map((asistencia) => (
              <tr key={asistencia.id_asistencia}>
                <td className="border border-gray-300 p-2">{asistencia.matricula}</td>
                <td className="border border-gray-300 p-2">{asistencia.fecha}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Sección de búsqueda para la matrícula */}
        <div className="mt-4">
          <label htmlFor="busqueda" className="block text-xl font-medium text-white">
            Buscar Matrícula:
          </label>
          <input
            type="text"
            id="busqueda"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)} // Permite la entrada de búsqueda
            className="mt-1 p-2 border border-gray-300 rounded text-black"
            placeholder="Ingresa la matrícula a buscar"
          />
          <button
            onClick={() => setBusqueda(busqueda)} // Botón para buscar
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 ml-2"
          >
            Buscar
          </button>
        </div>

        {/* Paginación */}
        <div className="mt-4">
          {prevPage && (
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2"
            >
              Página Anterior
            </button>
          )}
          {nextPage && (
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Página Siguiente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Asistencias;
