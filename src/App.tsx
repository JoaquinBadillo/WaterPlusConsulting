import { lazy, useState, Suspense, createContext } from 'react';
import type { GlobeContextProps } from './types';

const Globe = lazy(() => import('./components/Globe'));

import countries from '@/assets/countries.json';
import { regions } from '@/assets/regions';

export const GlobeContext = createContext<GlobeContextProps>({
  globe: null, setGlobe: null,
  regionData: null, setRegionData: null,
  countryData: null, setCountryData: null,
  openModal: null, setOpenModal: null
});

function App() {
  const [regionData, setRegionData] = useState<any>({
    ...regions
  });
  const [countryData, setCountryData] = useState<any>({
    ...countries.countriesCollection
  });
  const [globe, setGlobe] = useState<any>();

  const [openModal, setOpenModal] = useState<string | null>(null);

  return (
    <GlobeContext.Provider value={{
      globe, setGlobe,
      regionData, setRegionData,
      countryData, setCountryData,
      openModal, setOpenModal
    }}>
      <div className="flex m-0 p-0 flex-[1] md:flex-row justify-center md:justify-start flex-wrap md:flex-nowrap -z-10">
        <div className='globe-container'>
          <Suspense fallback={<div className='loading-container'><div className='lds-ripple'><div></div><div></div></div></div>}>
            <Globe />
          </Suspense>
        </div>
        <div className="md:w-1/2 md:h-[100vh] bg-[#1e1e2e]">
      </div>
      </div>
    </GlobeContext.Provider>
  );
}

export default App;