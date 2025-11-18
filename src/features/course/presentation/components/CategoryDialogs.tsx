import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Dialog, Portal, Button, TextInput, RadioButton, Text } from 'react-native-paper';
import { Category } from '../../domain/entities/category';

interface AddCategoryDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onAdd: (name: string, groupingMethod: string, groupCount: number, studentsPerGroup: number) => Promise<void>;
}

export function AddCategoryDialog({ visible, onDismiss, onAdd }: AddCategoryDialogProps) {
  const [name, setName] = useState('');
  const [groupingMethod, setGroupingMethod] = useState('self-assigned');
  const [groupCount, setGroupCount] = useState('');
  const [studentsPerGroup, setStudentsPerGroup] = useState('');

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    const groupCountNum = parseInt(groupCount);
    const studentsPerGroupNum = parseInt(studentsPerGroup);

    if (isNaN(groupCountNum) || groupCountNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de grupos');
      return;
    }

    if (isNaN(studentsPerGroupNum) || studentsPerGroupNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de estudiantes por grupo');
      return;
    }

    await onAdd(name.trim(), groupingMethod, groupCountNum, studentsPerGroupNum);
    
    // Reset form
    setName('');
    setGroupingMethod('self-assigned');
    setGroupCount('');
    setStudentsPerGroup('');
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Nueva Categoría</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Nombre de la categoría"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Método de agrupación:</Text>
          <RadioButton.Group onValueChange={setGroupingMethod} value={groupingMethod}>
            <View style={styles.radioItem}>
              <RadioButton value="self-assigned" />
              <Text>Auto-asignado</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="manual" />
              <Text>Manual</Text>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Número de grupos"
            value={groupCount}
            onChangeText={setGroupCount}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Estudiantes por grupo"
            value={studentsPerGroup}
            onChangeText={setStudentsPerGroup}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button onPress={handleAdd}>Agregar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

interface EditCategoryDialogProps {
  visible: boolean;
  category: Category | null;
  onDismiss: () => void;
  onEdit: (category: Category) => Promise<void>;
}

export function EditCategoryDialog({ visible, category, onDismiss, onEdit }: EditCategoryDialogProps) {
  const [name, setName] = useState(category?.name || '');
  const [groupingMethod, setGroupingMethod] = useState(category?.groupingMethod || 'self-assigned');
  const [groupCount, setGroupCount] = useState(category?.groupCount.toString() || '');
  const [studentsPerGroup, setStudentsPerGroup] = useState(category?.studentsPerGroup.toString() || '');

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setGroupingMethod(category.groupingMethod);
      setGroupCount(category.groupCount.toString());
      setStudentsPerGroup(category.studentsPerGroup.toString());
    }
  }, [category]);

  const handleEdit = async () => {
    if (!category) return;

    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    const groupCountNum = parseInt(groupCount);
    const studentsPerGroupNum = parseInt(studentsPerGroup);

    if (isNaN(groupCountNum) || groupCountNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de grupos');
      return;
    }

    if (isNaN(studentsPerGroupNum) || studentsPerGroupNum <= 0) {
      Alert.alert('Error', 'Por favor ingresa un número válido de estudiantes por grupo');
      return;
    }

    const updatedCategory = new Category(
      category.id,
      name.trim(),
      groupingMethod as 'random' | 'self-assigned' | 'manual',
      groupCountNum,
      studentsPerGroupNum,
      category.activities
    );

    await onEdit(updatedCategory);
    onDismiss();
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Editar Categoría</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label="Nombre de la categoría"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.label}>Método de agrupación:</Text>
          <RadioButton.Group onValueChange={setGroupingMethod} value={groupingMethod}>
            <View style={styles.radioItem}>
              <RadioButton value="self-assigned" />
              <Text>Auto-asignado</Text>
            </View>
            <View style={styles.radioItem}>
              <RadioButton value="manual" />
              <Text>Manual</Text>
            </View>
          </RadioButton.Group>

          <TextInput
            label="Número de grupos"
            value={groupCount}
            onChangeText={setGroupCount}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Estudiantes por grupo"
            value={studentsPerGroup}
            onChangeText={setStudentsPerGroup}
            keyboardType="numeric"
            style={styles.input}
            mode="outlined"
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancelar</Button>
          <Button onPress={handleEdit}>Guardar</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
});

