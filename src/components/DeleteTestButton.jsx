'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Use 'next/router' if using Pages router

export default function DeleteTestButton({ testPaperId, onDeleteSuccess }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    // 1. Simple confirmation (You can replace this with a custom Modal later)
    if (!confirm('Are you sure you want to delete this test paper? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/test-paper/${testPaperId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      // 2. Handle Success
      if (onDeleteSuccess) {
        // If a callback is provided (e.g., to remove item from a list without refreshing)
        onDeleteSuccess(testPaperId);
      } else {
        // Fallback: Refresh the page or redirect
        router.refresh();
      }

    } catch (error) {
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDelete}
      disabled={isDeleting}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        text-sm font-medium transition-colors
        ${isDeleting
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700'
        }
      `}
      title="Delete Test Paper"
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Trash2 className="w-4 h-4" />
      )}
      <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
    </motion.button>
  );
}
