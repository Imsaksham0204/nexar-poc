import { useState, useEffect, useRef } from "react";
// import { seedData } from "./seedData.js";
import "./style.css";
import { useSelector } from "react-redux";
import { SignalChart } from "grl-react-assets/dist/index.cjs";


function Signal() {
  const [chartData, setChartData] = useState(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveDataState, setLiveDataState] = useState({
    currentTimeSeconds: 0,
    intervalCount: 0,
  });
  const [mode, setMode] = useState("static"); // 'live' or 'one-time'
  const intervalRef = useRef(null);
  const chartControlsRef = useRef(null);

  const { loading, signalData } = useSelector((state) => state.signal);

  // Generate random data for live mode with specific ranges
  // const generateRandomData = (yAxisKey) => {
  //   let randomValue;

  //   if (yAxisKey === "2") {
  //     // First dataset: range between 11.50 and 12.50
  //     randomValue = 11.5 + Math.random() * (12.5 - 11.5);
  //   } else if (yAxisKey === "3") {
  //     // Second dataset: range between -0.67 and 0.00
  //     randomValue = -0.67 + Math.random() * (0.0 - -0.67);
  //   } else {
  //     // Fallback for any other axis
  //     const originalData = seedData[yAxisKey];
  //     const { yaxisMin, yaxisMax } = originalData;
  //     randomValue = Math.random() * (yaxisMax - yaxisMin) + yaxisMin;
  //   }

  //   return randomValue;
  // };

  // // Initialize empty live data structure
  // const initializeLiveData = () => {
  //   const liveData = {};
  //   Object.keys(seedData).forEach((yAxisKey) => {
  //     const originalAxisData = seedData[yAxisKey];
  //     liveData[yAxisKey] = {
  //       ...originalAxisData,
  //       displayDataChunk: [],
  //       startDataLongTime: 0,
  //       endDataLongTime: 5 * Math.pow(10, 9), // 5 seconds in nanoseconds
  //       absoluteStartTime: 0,
  //       absoluteEndTime: 5 * Math.pow(10, 9),
  //     };
  //   });
  //   return liveData;
  // };

  // // Update chart data with new random values
  // const updateLiveData = () => {
  //   setChartData((prevData) => {
  //     const newData = { ...prevData };

  //     // Update each y-axis data
  //     Object.keys(newData).forEach((yAxisKey) => {
  //       const currentAxisData = newData[yAxisKey];
  //       let updatedDisplayDataChunk = [...currentAxisData.displayDataChunk];
  //       let currentEndTime = currentAxisData.endDataLongTime;

  //       // Generate 100 new data points per interval
  //       for (let i = 0; i < 100; i++) {
  //         const newDataPoint = generateRandomData(yAxisKey);
  //         updatedDisplayDataChunk.push(newDataPoint);
  //       }

  //       // Check if array has reached 1000 points
  //       if (updatedDisplayDataChunk.length >= 1000) {
  //         // Remove data from even indices (0, 2, 4, 6, ...)
  //         updatedDisplayDataChunk = updatedDisplayDataChunk.filter(
  //           (_, index) => index % 2 !== 0
  //         );

  //         // Increase end time by 5 seconds (keep start time at 0)
  //         currentEndTime += 5 * Math.pow(10, 9);
  //       }

  //       // Update the axis data
  //       newData[yAxisKey] = {
  //         ...currentAxisData,
  //         displayDataChunk: updatedDisplayDataChunk,
  //         startDataLongTime: 0, // Always keep start time at 0
  //         endDataLongTime: currentEndTime,
  //         absoluteStartTime: 0,
  //         absoluteEndTime: currentEndTime,
  //       };
  //     });

  //     return newData;
  //   });

  //   // Update live data state
  //   setLiveDataState((prev) => ({
  //     currentTimeSeconds: prev.currentTimeSeconds + 1,
  //     intervalCount: prev.intervalCount + 1,
  //   }));
  // };

  // Generate one-time random data
  const generateOneTimeData = () => {
    let store = [];
    setChartData((prevData) => {
      const newData = { ...prevData };

      // Update each y-axis data with random values
      Object.keys(newData).forEach((yAxisKey) => {
        const currentAxisData = newData[yAxisKey];
        let updatedDisplayDataChunk = [];

        // Generate 100 random data points for instant visualization
        for (let i = 0; i < 50000; i++) {
          const newDataPoint = generateRandomData(yAxisKey);
          updatedDisplayDataChunk.push(newDataPoint);
        }

        // for (let i = 0; i < 1000000; i++) {
        //     const newDataPoint = generateRandomData(yAxisKey);
        //     store.push(newDataPoint);
        // }

        // Update the axis data
        newData[yAxisKey] = {
          ...currentAxisData,
          displayDataChunk: updatedDisplayDataChunk,
          startDataLongTime: 0,
          endDataLongTime: 5 * Math.pow(10, 9),
          absoluteStartTime: 0,
          absoluteEndTime: 5 * Math.pow(10, 9),
        };
      });

      return newData;
    });
  };

  // Start live mode
  const startLiveMode = () => {
    if (!isLiveMode) {
      setIsLiveMode(true);
      setMode("live"); // Set mode to live
      // Initialize with empty live data
      const emptyLiveData = initializeLiveData();
      setChartData(emptyLiveData);
      // Reset live data state
      setLiveDataState({
        currentTimeSeconds: 0,
        intervalCount: 0,
      });
      // Update data every 1000ms (1 second)
      intervalRef.current = setInterval(updateLiveData, 1000);
    }
  };

  // Stop live mode
  const stopLiveMode = () => {
    if (isLiveMode) {
      setIsLiveMode(false);
      setMode("static"); // Set mode to static
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Reset to original seed data
  const resetData = () => {
    stopLiveMode();
    setChartData(seedData);
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (signalData) {
      setChartData(signalData);
    }
  }, [signalData]);

  return (
    // <div className="signal-container">
    //     <div className="live-chart-container">
    <>
      {/* <div className="controls">
            <button
                onClick={startLiveMode}
                disabled={isLiveMode}
                style={{
                    backgroundColor: isLiveMode ? '#ccc' : '#4CAF50',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLiveMode ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                }}
            >
                {isLiveMode ? 'Live Mode Active' : 'Start Live Mode'}
            </button>

            <button
                onClick={stopLiveMode}
                disabled={!isLiveMode}
                style={{
                    backgroundColor: !isLiveMode ? '#ccc' : '#f44336',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: !isLiveMode ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                }}
            >
                Stop Live Mode
            </button>                <button
                onClick={resetData}
                style={{
                    backgroundColor: '#FF9800',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                Reset Data
            </button>

            <button
                onClick={generateOneTimeData}
                disabled={isLiveMode}
                style={{
                    backgroundColor: isLiveMode ? '#ccc' : '#9C27B0',
                    color: 'white',
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: isLiveMode ? 'not-allowed' : 'pointer',
                    marginRight: '10px'
                }}
            >
                Generate Random Data
            </button>

            <div style={{ marginTop: '10px', fontSize: '14px' }}>
                Status: <span style={{ fontWeight: 'bold', color: isLiveMode ? 'green' : 'red' }}>
                    {isLiveMode ? 'LIVE' : 'STATIC'}
                </span>
            </div>
        </div> */}
      {/* <div className="chart-controls">
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.toggleHorizontalZoom()}
          title="Toggle Zoom"
        >
          🔍 Toggle Horizontal Zoom
        </button>
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.toggleVerticalZoom()}
          title="Toggle Zoom"
        >
          🔍 Toggle Vertical Zoom
        </button>
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.panUp()}
          title="Pan Up"
        >
          ↑
        </button>
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.panDown()}
          title="Pan Down"
        >
          ↓
        </button>
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.panLeft()}
          title="Pan Left"
        >
          ←
        </button>
        <button
          className="control-btn"
          onClick={() => chartControlsRef.current?.panRight()}
          title="Pan Right"
        >
          →
        </button>
      </div> */}

      <SignalChart
        ref={chartControlsRef}
        width={"100%"}
        height={"100%"}
        yAxisRef={["2", "3"]}
        yAxisColors={["violet", "red"]}
        yAxisNames={["Current", "Voltage"]}
        chartId="chart-1"
        chartData={chartData}
        startTime={58}
        endTime={4533043258}
        numOfLabels={2108}
        mode={mode}
      />
    </>
    //     </div>
    // </div>
  );
}

export default Signal;
