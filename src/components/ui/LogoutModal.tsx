import { LogOut } from 'lucide-react';
import { Button } from './Button';

interface LogoutModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onCancel, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Confirm Logout</h3>
            <p className="text-sm text-gray-500">Are you sure you want to log out?</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}