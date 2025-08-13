import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DynamicForm from '../components/forms/DynamicForm';
import { ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';

interface FormViewProps {
  mode: 'create' | 'edit' | 'view';
}

const FormView: React.FC<FormViewProps> = ({ mode }) => {
  const { module, doctype, docname } = useParams();
  const navigate = useNavigate();

  const handleSave = (doc: any) => {
    console.log('Document saved:', doc);
    // Navigate back to list or show success message
    navigate(`/${module}/${doctype}`);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          icon={<ArrowLeft className="h-4 w-4" />}
        >
          Back
        </Button>
        
        <nav className="flex items-center space-x-2 text-sm text-gray-500">
          <span>{module}</span>
          <span>/</span>
          <span>{doctype}</span>
          {docname && (
            <>
              <span>/</span>
              <span className="font-medium">{docname}</span>
            </>
          )}
        </nav>
      </div>

      {/* Dynamic Form */}
      {doctype && (
        <DynamicForm
          doctype={doctype}
          docname={docname}
          mode={mode}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default FormView;