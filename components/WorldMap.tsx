
import React from 'react';

interface WorldMapProps {
  isOpen: boolean;
  onClose: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-cover bg-center bg-no-repeat w-full max-w-4xl max-h-[90vh] text-gray-800 rounded-lg shadow-2xl border-4 border-amber-800 p-6 md:p-8 overflow-y-auto"
        style={{backgroundImage: "url('https://i.pinimg.com/736x/7b/03/6b/7b036b135b5a452a8a5f643e2de30a21.jpg')"}}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b-2 border-amber-900/50 pb-4 mb-6">
          <h2 className="text-4xl md:text-5xl font-pirate text-amber-900 drop-shadow-sm">Mapa do Mundo</h2>
          <button onClick={onClose} className="text-2xl font-bold text-amber-900 hover:text-red-700 transition-colors">&times;</button>
        </div>

        <div className="space-y-8">
          <Region title="East Blue" description="Considerado o mais fraco dos quatro mares, o East Blue é o lar de muitos piratas novatos e ilhas pacíficas. É o ponto de partida para inúmeras lendas.">
            <Island name="Vila Foosha" details="Uma vila pacata e o lar de Monkey D. Luffy." />
            <Island name="Loguetown" details="A 'Cidade do Começo e do Fim', onde Gold Roger nasceu e foi executado. A última parada antes da Grand Line." />
            <Island name="Arlong Park" details="Uma ilha que já esteve sob o domínio tirânico do Homem-Peixe Arlong." />
          </Region>

          <Region title="Grand Line" description="A 'Cemitério dos Piratas'. Uma corrente oceânica perigosa e imprevisível que circunda o mundo, onde o clima e o magnetismo são caóticos. É dividida em duas metades: 'Paraíso' e 'Novo Mundo'.">
            <Island name="Alabasta" details="Um vasto reino desértico com uma história rica, ameaçado por uma organização secreta." />
            <Island name="Water 7" details="A 'Cidade da Água', famosa por seus incríveis carpinteiros e pelo sistema de canais." />
            <Island name="Enies Lobby" details="A ilha judicial do Governo Mundial, considerada impenetrável." />
          </Region>

          <Region title="Novo Mundo" description="A segunda metade da Grand Line, governada pelos temíveis Yonkou (Quatro Imperadores). Apenas as tripulações piratas mais fortes e insanas ousam navegar por estas águas.">
            <Island name="Punk Hazard" details="Uma ilha com um lado em chamas e outro congelado, resultado de uma batalha lendária." />
            <Island name="Dressrosa" details="Um reino de paixão e brinquedos, governado por um dos Shichibukai." />
            <Island name="Wano" details="Uma terra de samurais, fechada para o resto do mundo e sob o controle de um Yonkou." />
          </Region>
        </div>
      </div>
    </div>
  );
};

const Region: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div className="bg-amber-50/70 p-4 rounded-md border border-amber-800/30">
        <h3 className="text-3xl font-pirate text-amber-900 mb-2">{title}</h3>
        <p className="text-md text-amber-900/90 mb-4 italic">{description}</p>
        <div className="space-y-2 pl-4 border-l-2 border-amber-800/40">
            {children}
        </div>
    </div>
);

const Island: React.FC<{ name: string; details: string }> = ({ name, details }) => (
    <div>
        <h4 className="font-bold text-lg text-amber-900">{name}</h4>
        <p className="text-sm text-amber-800">{details}</p>
    </div>
);


export default WorldMap;
