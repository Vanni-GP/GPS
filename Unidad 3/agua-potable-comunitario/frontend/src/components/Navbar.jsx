import Link from 'next/link';
import { Droplet, Users, CreditCard, FileText, AlertTriangle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-blue-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 font-bold text-xl">
            <Droplet className="h-7 w-7 text-blue-200 fill-current" />
            <span>Agua Potable Ejidal</span>
          </div>
          <div className="flex space-x-4">
            <Link href="/" className="flex items-center space-x-1 hover:bg-blue-600 px-3 py-2 rounded-md font-medium text-sm">
              <Users className="h-4 w-4" />
              <span>Vecinos</span>
            </Link>
            <Link href="/tomas" className="flex items-center space-x-1 hover:bg-blue-600 px-3 py-2 rounded-md font-medium text-sm">
              <Droplet className="h-4 w-4" />
              <span>Tomas</span>
            </Link>
            <Link href="/cobranza" className="flex items-center space-x-1 hover:bg-blue-600 px-3 py-2 rounded-md font-medium text-sm">
              <CreditCard className="h-4 w-4" />
              <span>Caja de Cobro</span>
            </Link>
            <Link href="/recibos" className="flex items-center space-x-1 hover:bg-blue-600 px-3 py-2 rounded-md font-medium text-sm">
              <FileText className="h-4 w-4" />
              <span>Recibos</span>
            </Link>
            <Link href="/fugas" className="flex items-center space-x-1 hover:bg-blue-600 px-3 py-2 rounded-md font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>Fugas</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}