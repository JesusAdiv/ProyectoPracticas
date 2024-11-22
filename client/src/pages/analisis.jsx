// import React from "react";

import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { useContext, useEffect, useState } from "react";
import PieChart from "../components/pieChart";
import { BarChart } from "../components/barChart";
import LineChart from "../components/lineChart";
import { claseContext, NavContext } from "../layouts/layoutProfesor";
import CardStats from "../components/cardStats";
import Asistencia_Por_Alumnos from "../components/asistenciasPorAlumnos";


export const Data = [
    {
      id: 1,
      year: 2016,
      userGain: 80000,
      userLost: 823
    },
    {
      id: 2,
      year: 2017,
      userGain: 45677,
      userLost: 345
    },
    {
      id: 3,
      year: 2018,
      userGain: 78888,
      userLost: 555
    },
    {
      id: 4,
      year: 2019,
      userGain: 90000,
      userLost: 4555
    },
    {
      id: 5,
      year: 2020,
      userGain: 4300,
      userLost: 234
    }
  ];
  

Chart.register(CategoryScale);

function Analisis() {

  const { dataClase } = useContext(claseContext);
  const { showNav } = useContext(NavContext);
  const backgroundColor = [
    "rgba(75,192,192,1)",
    "#ecf0f1",
    "#50AF95",
    "#f3ba2f",
    "#2a71d0"
  ];

  const defaultDataChart = {
    labels: Data.map((data) => data.year),
    datasets: [
        {
          label: "Users Gained ",
          data: Data.map((data) => data.userGain),
          backgroundColor,
          borderColor: "white",
          borderWidth: 1
        }
      ]
  }

  const [chartData, setChartData] = useState(defaultDataChart);
  const [pieCriterios, setPieCriterios] = useState(defaultDataChart);
  const [asistencia_Por_Alumnos, setAsistencia_Por_Alumnos] = useState(defaultDataChart);
  const [distribucion_Calificaciones, setdistribucion_Calificaciones] = useState(defaultDataChart);
  const [cardStatsData, setCardStatsData] = useState([]);
  const [promedioDeClase, setPromedioDeClase] = useState();
  useEffect(() => {
    showNav();
    fetchAnalisis();
    fetchAsistencias();
    fetchDistAsist();
  }, [showNav, dataClase]);

  const nrc_clase = dataClase.nrc;
  const fetchAnalisis = async () => {
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}entregas/tipos/${nrc_clase}/`);
      if (response.ok) {
        const result = await response.json();
        console.log(result);
        
        // Actualizamos el estado de los datos con la api
        const {
          criterios,
          entregas_por_tipo, 
          asistencias_mensuales,
          promedioDeClase
        } = result;

        setPromedioDeClase(promedioDeClase); 
        const meses = asistencias_mensuales.map((item) => Object.keys(item)[0]);
        const valores = asistencias_mensuales.map((item) => Object.values(item)[0]);

        // Actualizar pieCriterios con datos de criterios
        setPieCriterios({
          labels: criterios.map((data)=> data.nombre),
          datasets: [
            {
              label: "Ponderación de Criterios",
              data: criterios.map((data)=> data.ponderacion),
              backgroundColor,
              borderColor: "white",
              borderWidth: 1
            }
          ]
        });

        setCardStatsData(Object.entries(entregas_por_tipo).map(([tipo, cantidad]) => ({
          title: tipo,
          number: cantidad,
          // icon: iconMapping[tipo]?.icon || "pi pi-chart-bar", // Valor por defecto
          color: "bg-pink-200", // Valor por defecto
        })));
        
        setChartData({
          labels: meses, // Labels son los meses
          datasets: [
            {
              label: "Asistencias Mensuales",
              data: valores, // Valores de asistencias
              backgroundColor: [
                "rgba(75,192,192,1)",
                "#ecf0f1",
                "#50AF95",
                "#f3ba2f",
                "#2a71d0"
              ],
              borderColor: "white",
              borderWidth: 1
            }
          ]
        });       
        
      } else {
        console.error('Error al obtener la data:', response.statusText);
      }
    } catch (error) {
      console.error('Error al conectar con el servidor:', error);
    }
  };

  const fetchAsistencias = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/asistencia_por_clase/${nrc_clase}/`);
      if (response.ok) {
        const result = await response.json();
        console.log("Asistencias Rsult: ", result);        
        console.log("Asistencias I map: ", result.map((data)=> data.matricula));

        setAsistencia_Por_Alumnos({
          labels: result.map((data)=> data.matricula),
          datasets: [
            {
              label: "Asistencias",
              data: result.map((data)=> data.total_asistencias), // Los valores de ponderación de cada criterio
              backgroundColor,
              borderColor: "white",
              borderWidth: 1
            }
          ]
        });
        
      } else{ 
        console.error('Error al obtener la data:', response.statusText);
      }
    } catch (error) {
      console.log(error);
      
    }    
  }

  const fetchDistAsist = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}api/distribucion_calificaciones/${nrc_clase}/`);
      if (response.ok) {
        const result = await response.json();
        console.log("distribucion_calificaciones: ", result);        

        setdistribucion_Calificaciones({
          labels: result.map((data)=> data.nota),
          datasets: [
            {
              label: "Alumnos",
              data: result.map((data)=> data.cantidad), // Los valores de ponderación de cada criterio
              backgroundColor,
              borderColor: "white",
              borderWidth: 1
            }
          ]
        });
        
      } else{ 
        console.error('Error al obtener la data:', response.statusText);
      }
    } catch (error) {
      console.log(error);
      
    }    
  }

    return (
        <>
        <div className="flex justify-between">
            <h2 className="text-3xl font-semibold ml-6 mt-1 mb-4">Analisis De La Materia</h2>
            <h3>Promedio de la Materia: {promedioDeClase}</h3>
        </div>

    <div className="flex gap-4 p-4 overflow-x-auto">
      
      {cardStatsData.length > 0 ? (
          cardStatsData.map((data, index) => (
            <CardStats
              key={index}
              titleCard={data.title}
              numberCard={data.number}
              iconCard={"pi pi-chart-bar"}
              iconColor={data.color}
            />
          ))
        ) : (
          <p>No hay datos disponibles</p>
        )}
      {/* Colores de ionos bg-red-200,  bg-orange-200, bg-pink-200 bg-blue-200*/}
    </div>

        <div className="grid grid-cols-3 gap-3">
            <PieChart chartDataChild={pieCriterios} titleChart={"Criterios"} />
            <BarChart chartDataChild={distribucion_Calificaciones} titleChart={"Distribucion de Calificaciones"} />
            <LineChart chartDataChild={chartData} titleChart={"Asistencias Mensuales"} />
        </div>
        {/* <div>
         <Asistencia_Por_Alumnos />
        </div> */}

        <div>
          <BarChart chartDataChild={asistencia_Por_Alumnos} titleChart={"Asistencias Por Alumno"} />
        </div>

        </>
    )
}

export default Analisis;