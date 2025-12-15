import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteDialogProps {
  open: boolean;
  title: string;
  description?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isConfirming: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  open,
  title,
  description,
  onCancel,
  onConfirm,
  isConfirming,
}) => {
  return (
    <AlertDialog open={open} onOpenChange={(val) => !val && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          )}
        </AlertDialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <AlertDialogCancel asChild>
            <Button variant="ghost" onClick={onCancel} disabled={isConfirming}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isConfirming}
            >
              {isConfirming ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteDialog;
