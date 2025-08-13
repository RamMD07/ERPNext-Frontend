import React, { useEffect, useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { DocType, DocField, Document, FieldType } from '../../types/frappe';
import { useMetadataStore, useDocumentStore } from '../../store';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import FieldRenderer from './FieldRenderer';
import { motion } from 'framer-motion';
import { Save, Send, X, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

interface DynamicFormProps {
  doctype: string;
  docname?: string;
  onSave?: (doc: Document) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit' | 'view';
}

const DynamicForm: React.FC<DynamicFormProps> = ({
  doctype,
  docname,
  onSave,
  onCancel,
  mode = 'create',
}) => {
  const { loadDocType, getDocType } = useMetadataStore();
  const { loadDocument, saveDocument, currentDoc } = useDocumentStore();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [doctypeData, setDoctypeData] = useState<DocType | null>(null);

  // Load DocType and Document
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const doctype_data = await loadDocType(doctype);
        setDoctypeData(doctype_data);
        
        if (docname && mode !== 'create') {
          await loadDocument(doctype, docname);
        }
      } catch (error) {
        console.error('Failed to load form data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [doctype, docname, mode, loadDocType, loadDocument]);

  // Generate validation schema
  const validationSchema = useMemo(() => {
    if (!doctypeData) return yup.object();

    const schema: Record<string, any> = {};

    doctypeData.fields.forEach((field: DocField) => {
      if (field.fieldtype === 'Section Break' || field.fieldtype === 'Column Break' || field.fieldtype === 'Tab Break') {
        return;
      }

      let fieldSchema: any;

      switch (field.fieldtype) {
        case 'Int':
        case 'Float':
        case 'Currency':
        case 'Percent':
          fieldSchema = yup.number();
          if (field.validation?.min_value !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min_value);
          }
          if (field.validation?.max_value !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max_value);
          }
          break;
        
        case 'Data':
        case 'Small Text':
        case 'Text':
        case 'Long Text':
          fieldSchema = yup.string();
          if (field.validation?.min_length !== undefined) {
            fieldSchema = fieldSchema.min(field.validation.min_length);
          }
          if (field.validation?.max_length !== undefined) {
            fieldSchema = fieldSchema.max(field.validation.max_length);
          }
          if (field.validation?.pattern) {
            fieldSchema = fieldSchema.matches(new RegExp(field.validation.pattern));
          }
          break;
        
        case 'Date':
        case 'Datetime':
          fieldSchema = yup.date();
          break;
        
        case 'Check':
          fieldSchema = yup.boolean();
          break;
        
        case 'Select':
        case 'Link':
          fieldSchema = yup.string();
          break;
        
        default:
          fieldSchema = yup.mixed();
      }

      if (field.reqd && !field.read_only) {
        fieldSchema = fieldSchema.required(`${field.label} is required`);
      }

      schema[field.fieldname] = fieldSchema;
    });

    return yup.object(schema);
  }, [doctypeData]);

  // Initialize form
  const defaultValues = useMemo(() => {
    const values: Record<string, any> = {};
    
    if (doctypeData) {
      doctypeData.fields.forEach((field: DocField) => {
        if (field.fieldtype === 'Section Break' || field.fieldtype === 'Column Break' || field.fieldtype === 'Tab Break') {
          return;
        }

        if (currentDoc && mode !== 'create') {
          values[field.fieldname] = currentDoc[field.fieldname];
        } else if (field.default !== undefined) {
          values[field.fieldname] = field.default;
        } else {
          switch (field.fieldtype) {
            case 'Check':
              values[field.fieldname] = false;
              break;
            case 'Int':
            case 'Float':
            case 'Currency':
            case 'Percent':
              values[field.fieldname] = 0;
              break;
            default:
              values[field.fieldname] = '';
          }
        }
      });
    }

    return values;
  }, [doctypeData, currentDoc, mode]);

  const { control, handleSubmit, watch, formState: { errors, isDirty }, reset } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues,
    mode: 'onChange',
  });

  // Reset form when data changes
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  // Handle form submission
  const onSubmit = async (data: any) => {
    if (!doctypeData) return;

    setSubmitting(true);
    try {
      const docData: Partial<Document> = {
        doctype: doctype,
        ...data,
      };

      if (mode !== 'create' && currentDoc) {
        docData.name = currentDoc.name;
      }

      const savedDoc = await saveDocument(docData);
      onSave?.(savedDoc);
    } catch (error) {
      console.error('Failed to save document:', error);
      // Handle error (show toast notification)
    } finally {
      setSubmitting(false);
    }
  };

  // Group fields by sections
  const fieldGroups = useMemo(() => {
    if (!doctypeData) return [];

    const groups: { section: string; fields: DocField[] }[] = [];
    let currentSection = 'Main';
    let currentFields: DocField[] = [];

    doctypeData.fields.forEach((field: DocField) => {
      if (field.fieldtype === 'Section Break') {
        if (currentFields.length > 0) {
          groups.push({ section: currentSection, fields: currentFields });
        }
        currentSection = field.label || 'Section';
        currentFields = [];
      } else if (field.fieldtype !== 'Column Break' && field.fieldtype !== 'Tab Break') {
        currentFields.push(field);
      }
    });

    if (currentFields.length > 0) {
      groups.push({ section: currentSection, fields: currentFields });
    }

    return groups;
  }, [doctypeData]);

  if (loading) {
    return (
      <Card className="animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!doctypeData) {
    return (
      <Card>
        <div className="flex items-center space-x-3 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Failed to load form metadata</span>
        </div>
      </Card>
    );
  }

  const isReadOnly = mode === 'view';
  const canSubmit = doctypeData.is_submittable && currentDoc?.docstatus === 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Header */}
      <Card>
        <Card.Header>
          <div>
            <Card.Title>
              {mode === 'create' ? `New ${doctypeData.label}` : currentDoc?.name || doctypeData.label}
            </Card.Title>
            {currentDoc && (
              <div className="flex items-center space-x-2 mt-1">
                <span className={clsx(
                  'px-2 py-1 rounded-full text-xs font-medium',
                  {
                    'bg-yellow-100 text-yellow-800': currentDoc.docstatus === 0,
                    'bg-green-100 text-green-800': currentDoc.docstatus === 1,
                    'bg-red-100 text-red-800': currentDoc.docstatus === 2,
                  }
                )}>
                  {currentDoc.docstatus === 0 ? 'Draft' : 
                   currentDoc.docstatus === 1 ? 'Submitted' : 'Cancelled'}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} size="sm">
                <X className="h-4 w-4" />
                Cancel
              </Button>
            )}
            
            {!isReadOnly && (
              <Button
                type="submit"
                loading={submitting}
                disabled={!isDirty && mode === 'edit'}
                size="sm"
                icon={<Save className="h-4 w-4" />}
              >
                {mode === 'create' ? 'Create' : 'Update'}
              </Button>
            )}
            
            {canSubmit && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                icon={<Send className="h-4 w-4" />}
              >
                Submit
              </Button>
            )}
          </div>
        </Card.Header>
      </Card>

      {/* Form Sections */}
      <div className="space-y-6">
        {fieldGroups.map((group, groupIndex) => (
          <motion.div
            key={group.section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card>
              <Card.Header>
                <Card.Title>{group.section}</Card.Title>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.fields.map((field: DocField) => (
                    <div
                      key={field.fieldname}
                      className={clsx(
                        field.fieldtype === 'Long Text' || field.fieldtype === 'Text Editor' || field.fieldtype === 'HTML Editor' 
                          ? 'md:col-span-2 lg:col-span-3' 
                          : 'col-span-1'
                      )}
                    >
                      <Controller
                        name={field.fieldname}
                        control={control}
                        render={({ field: formField, fieldState }) => (
                          <FieldRenderer
                            field={field}
                            value={formField.value}
                            onChange={formField.onChange}
                            error={fieldState.error?.message}
                            disabled={isReadOnly || field.read_only}
                            doctype={doctype}
                            allValues={watch()}
                          />
                        )}
                      />
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        ))}
      </div>
    </form>
  );
};

export default DynamicForm;