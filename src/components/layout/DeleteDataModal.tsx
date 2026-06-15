import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Alert } from '../ui/Alert';
import { clearAllAppData } from '../../lib/clearAllData';

interface DeleteDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCleared?: () => void;
}

export function DeleteDataModal({ isOpen, onClose, onCleared }: DeleteDataModalProps) {
  const [clearing, setClearing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
    }
  }, [isOpen]);

  const handleClose = (): void => {
    if (clearing) return;
    onClose();
  };

  const handleConfirm = async (): Promise<void> => {
    setClearing(true);
    setError(null);
    try {
      await clearAllAppData();
      onCleared?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'לא ניתן למחוק את הנתונים');
    } finally {
      setClearing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="מחיקת כל הנתונים" size="sm">
      <div className="space-y-4">
        {error && (
          <Alert variant="error" title="המחיקה נכשלה">
            <p>{error}</p>
          </Alert>
        )}

        <Alert variant="warning" title="פעולה בלתי הפיכה">
          <p>
            פעולה זו תמחק לצמיתות את כל הנתונים השמורים בדפדפן, כולל נכסים, הגדרות משכנתא,
            תרחישים ומפתח ממשק. לא ניתן לשחזר את המידע לאחר המחיקה.
          </p>
        </Alert>

        <ul className="list-inside list-disc space-y-1 text-sm text-slate-400">
          <li>רשימת הנכסים והעלויות</li>
          <li>פרמטרי משכנתא ודירה</li>
          <li>הגדרות תרחישים (א׳, ב׳, ג׳)</li>
          <li>מפתח OpenRouter API</li>
        </ul>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={clearing}
            className="flex-1 rounded-lg border border-slate-600 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={() => void handleConfirm()}
            disabled={clearing}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-danger py-2 text-sm font-medium text-white transition-colors hover:bg-danger/80 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            {clearing ? 'מוחק...' : 'מחק הכל'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
