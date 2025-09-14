import { useState, useEffect } from 'react';
import TopBar from './components/Navigation/TopBar';
import SideBar from './components/Navigation/SideBar';
import FinancialDataTable from './components/DataTable/FinancialDataTable';
import ChartContainer from './components/Visualizations/ChartContainer';
import ConstitutionToggle from './components/Controls/ConstitutionToggle';
import SettingsPanel from './components/Controls/SettingsPanel';
import { useFinancialData } from './hooks/useFinancialData';
import type { Anomaly } from './types';

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [constitutionMode, setConstitutionMode] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [updateFrequency, setUpdateFrequency] = useState(3000); // Update every 3 seconds
  const [, setCurrentAnomaly] = useState<Anomaly | null>(null);
  const [fullscreenChart, setFullscreenChart] = useState<number | null>(null);

  const {
    events,
    charts,
    anomalies,
    isConnected,
    isLoading,
    datasetInfo,
    updateFrequencyRate
  } = useFinancialData(updateFrequency);

  useEffect(() => {
    if (anomalies.length > 0) {
      setCurrentAnomaly(anomalies[anomalies.length - 1]);
    }
  }, [anomalies]);

  const handleUpdateFrequency = (newFrequency: number) => {
    setUpdateFrequency(newFrequency);
    updateFrequencyRate(newFrequency);
  };

  return (
    <div className="h-screen w-screen bg-posthog-bg-primary flex flex-col overflow-hidden">
      <TopBar
        onSettingsClick={() => setSettingsOpen(true)}
        onConstitutionToggle={() => setConstitutionMode(!constitutionMode)}
        constitutionMode={constitutionMode}
      />

      <div className="flex-1 flex overflow-hidden">
        <SideBar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Data Table (40%) */}
          <div className="w-2/5 p-4 overflow-hidden">
            <FinancialDataTable
              events={events}
              datasetInfo={datasetInfo}
            />
          </div>

          {/* Right Panel - Visualizations (60%) */}
          <div className="w-3/5 p-4 overflow-hidden">
            <div className="h-full flex flex-col space-y-4">
              {/* Constitution Toggle */}
              {constitutionMode && (
                <div className="flex-shrink-0">
                  <ConstitutionToggle
                    enabled={constitutionMode}
                    onToggle={() => setConstitutionMode(!constitutionMode)}
                  />
                </div>
              )}

              {/* Connection Status */}
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-posthog-text-primary">
                  AI-Powered Visualizations
                </h2>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-posthog-success' : 'bg-posthog-error'}`} />
                  <span className="text-xs text-posthog-text-secondary">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="flex-1 grid grid-cols-2 gap-4 overflow-hidden">
                {isLoading ? (
                  <div className="col-span-2 flex items-center justify-center">
                    <div className="text-posthog-text-secondary">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-posthog-accent"></div>
                      <p className="mt-4">Loading fraud dataset...</p>
                    </div>
                  </div>
                ) : charts.length > 0 ? (
                  charts.map((chart, index) => (
                    <div key={index} className="min-h-[300px]">
                      <ChartContainer
                        chart={chart}
                        isFullscreen={fullscreenChart === index}
                        onToggleFullscreen={() => setFullscreenChart(fullscreenChart === index ? null : index)}
                        constitutionMode={constitutionMode}
                      />
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 flex items-center justify-center">
                    <p className="text-posthog-text-secondary">Waiting for data...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        updateFrequency={updateFrequency}
        onUpdateFrequency={handleUpdateFrequency}
      />

      {/* Toast Notifications - Disabled */}
    </div>
  );
}

export default App;