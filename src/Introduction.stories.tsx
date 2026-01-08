import type { Meta, StoryObj } from '@storybook/react-vite';

const meta = {
  title: 'Books-UI/Introducción',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Welcome: Story = {
  render: () => (
    <div style={{
      display: 'grid',
      placeContent: 'center',
      width: '100vw',
      height: '100vh',
      backgroundColor: '#0F0521',
      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 800 800'%3E%3Cg fill='none' stroke='%23280E57' stroke-width='1'%3E%3Cpath d='M769 229L1037 260.9M927 880L731 737 520 660 309 538 40 599 295 764 126.5 879.5 40 599-197 493 102 382-31 229 126.5 79.5-69-63'/%3E%3Cpath d='M-31 229L237 261 390 382 603 493 308.5 537.5 101.5 381.5M370 905L295 764'/%3E%3Cpath d='M520 660L578 842 731 737 840 599 603 493 520 660 295 764 309 538 390 382 539 269 769 229 577.5 41.5 370 105 295 -36 126.5 79.5 237 261 102 382 40 599 -69 737 127 880'/%3E%3Cpath d='M520-140L578.5 42.5 731-63M603 493L539 269 237 261 370 105M902 382L539 269M390 382L102 382'/%3E%3Cpath d='M-222 42L126.5 79.5 370 105 539 269 577.5 41.5 927 80 769 229 902 382 603 493 731 737M295-36L577.5 41.5M578 842L295 764M40-201L127 80M102 382L-261 269'/%3E%3C/g%3E%3Cg fill='%237026F4'%3E%3Ccircle cx='769' cy='229' r='5'/%3E%3Ccircle cx='539' cy='269' r='5'/%3E%3Ccircle cx='603' cy='493' r='5'/%3E%3Ccircle cx='731' cy='737' r='5'/%3E%3Ccircle cx='520' cy='660' r='5'/%3E%3Ccircle cx='309' cy='538' r='5'/%3E%3Ccircle cx='295' cy='764' r='5'/%3E%3Ccircle cx='40' cy='599' r='5'/%3E%3Ccircle cx='102' cy='382' r='5'/%3E%3Ccircle cx='127' cy='80' r='5'/%3E%3Ccircle cx='370' cy='105' r='5'/%3E%3Ccircle cx='578' cy='42' r='5'/%3E%3Ccircle cx='237' cy='261' r='5'/%3E%3Ccircle cx='390' cy='382' r='5'/%3E%3C/g%3E%3C/svg%3E\")",
      color: 'white',
      textAlign: 'center',
      padding: '2rem'
    }}>
      <div>
        <h1 style={{ 
          fontSize: '10rem', 
          marginBottom: '1rem', 
          color: 'transparent',
          WebkitTextStroke: '4px #e8e0f6',
          WebkitTextFillColor: 'transparent'
        }}>
          Books UI
        </h1>
        <p style={{ fontSize: '1.2em', marginBottom: '2rem' }}>
          Biblioteca de componentes React para aplicaciones modernas y accesibles.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🎨 Componentes</h3>
            <p>20+ componentes listos para usar</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>⚡ TypeScript</h3>
            <p>Tipado completo y seguro</p>
          </div>
          <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>🎯 Accesible</h3>
            <p>Siguiendo estándares WAI-ARIA</p>
          </div>
        </div>
      </div>
    </div>
  ),
};
