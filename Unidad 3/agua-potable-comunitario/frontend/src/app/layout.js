import "./globals.css";

export const metadata = {
  title: "Sistema de Agua Potable Comunitario",
  description: "Gestión de cobros, padrón y fugas para ejido",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}