import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Controller } from 'react-hook-form';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeType, useTheme } from 'rn-vs-lb/theme';
import { LARGE_FILE_ERROR } from '../../constants';
import { useImageCompressor } from '../../helpers/hooks';

export interface ImageUploaderProps {
  name: string;
  control: any;
  label?: string;
  style?: object;
  containerStyle?: object;
  rules?: object;
  defaultValue?: string[];
  errorTextStyle?: object;
  required?: boolean;
  setRemovedImages?: any;
  disabled?: boolean;
  maxImages?: number;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  name,
  control,
  label,
  style,
  containerStyle,
  rules = {},
  defaultValue = [],
  errorTextStyle,
  required,
  setRemovedImages,
  disabled,
  maxImages = 3,
}) => {
  const { theme, formStyles } = useTheme();
  const styles = getStyles({ theme });

  const [imageUris, setImageUris] = useState<string[]>(defaultValue);
  const defaultValueRef = useRef(defaultValue);
  const { compressImage } = useImageCompressor();

  const handleImagePick = async (onChange: any) => {
    if (disabled) return;
    if (imageUris.length >= maxImages) {
      alert(`You can upload a maximum of ${maxImages} images`);
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: Math.min(maxImages - imageUris.length, 10),
      quality: 1,
    });

    if (result.didCancel) return;
    if (result.assets && result.assets.length > 0) {
      const maxFileSize = 40 * 1024 * 1024; // 40 MB
      const newUris: string[] = [];

      for (const asset of result.assets) {
        if (asset.fileSize && asset.fileSize > maxFileSize) {
          alert(LARGE_FILE_ERROR);
          continue;
        }

        if (asset.uri) {
          try {
            let imageUri = asset.uri;
            if (asset.uri && asset.width && asset.height) {
              imageUri = await compressImage(asset.uri, asset.width, asset.height);
            }
            newUris.push(imageUri);
          } catch (err) {
            console.error('Image compression failed:', err);
            alert('Failed to compress image');
          }
        }
      }

      const updatedUris = [...imageUris, ...newUris].slice(0, maxImages);
      setImageUris(updatedUris);
      onChange(updatedUris);
    }
  };

  const handleRemoveImage = (uri: string, onChange: any) => {
    const updatedUris = imageUris.filter((u) => u !== uri);
    setImageUris(updatedUris);
    onChange(updatedUris);
    if (defaultValueRef.current.includes(uri)) {
      setRemovedImages?.((prev: string[]) => [...(prev || []), uri]);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={formStyles.label}>
          {required && <Text style={formStyles.required}>* </Text>}
          {label}
        </Text>
      )}
      <Controller
        control={control}
        name={name}
        rules={rules}
        defaultValue={defaultValue}
        render={({ field: { onChange }, fieldState: { error } }) => (
          <>
            <TouchableOpacity
              style={[formStyles.inputBorder, styles.uploadButton, style, disabled && { opacity: 0.5 }]}
              onPress={() => handleImagePick(onChange)}
              disabled={disabled}
            >
              <Text style={styles.uploadButtonText}>
                {imageUris.length < maxImages
                  ? 'Upload Image'
                  : `Maximum ${maxImages} images`}
              </Text>
            </TouchableOpacity>
            <View style={styles.imageContainer}>
              {imageUris.map((uri) => (
                <View key={uri} style={styles.imageWrapper}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  {!disabled && (
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveImage(uri, onChange)}
                    >
                      <Text style={styles.removeButtonText}>X</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {error && <Text style={[formStyles.errorText, errorTextStyle]}>{error.message}</Text>}
          </>
        )}
      />
    </View>
  );
};

const getStyles = ({ theme }: { theme: ThemeType }) =>
  StyleSheet.create({
    container: {},
    uploadButton: {
      backgroundColor: theme.white,
      padding: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    uploadButtonText: {
      color: theme.text,
      fontSize: 16,
    },
    imageContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 10,
    },
    imageWrapper: {
      position: 'relative',
      marginRight: 10,
      marginBottom: 10,
    },
    imagePreview: {
      width: 100,
      height: 100,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 5,
    },
    removeButton: {
      position: 'absolute',
      top: 2,
      right: 2,
      backgroundColor: theme.backgroundBtn,
      borderRadius: 15,
      width: 25,
      height: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    removeButtonText: {
      color: theme.black,
      fontSize: 14,
    },
  });

export default ImageUploader;
