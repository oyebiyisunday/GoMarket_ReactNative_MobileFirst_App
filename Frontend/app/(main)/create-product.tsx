import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { CustomButton, CustomInput, Loading } from '../../src/components/common';
import { AppStyles, AppColors } from '../../src/styles/AppStyles';
import { API_BASE } from '../../src/lib/config';

export default function CreateProductScreen() {
  const { token, user } = useAuth();
  const showAllMenus = process.env.EXPO_PUBLIC_SHOW_ALL_MENUS === 'true';
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    brand: '',
    model: '',
    price: '',
    openingStock: '',
    minStockLevel: '',
    imageUrl: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: '',
      unit: 'cm'
    },
    specifications: '',
    tags: '',
    metaTitle: '',
    metaDescription: '',
    searchKeywords: '',
    isPublicListing: true,
    isTrackInventory: true
  });

  useEffect(() => {
    if (!showAllMenus && user?.userType !== 'entity') {
      Alert.alert('Access Denied', 'Only business accounts can create products.');
      router.replace('/(main)');
      return;
    }
  }, [user, showAllMenus]);

  const updateFormData = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Validation Error', 'Product name is required');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      Alert.alert('Validation Error', 'Valid price is required');
      return false;
    }
    if (!formData.openingStock || parseInt(formData.openingStock) < 0) {
      Alert.alert('Validation Error', 'Valid opening stock is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category.trim() || null,
        brand: formData.brand.trim() || null,
        model: formData.model.trim() || null,
        price: parseFloat(formData.price),
        openingStock: parseInt(formData.openingStock),
        currentStock: parseInt(formData.openingStock),
        totalSupply: parseInt(formData.openingStock),
        minStockLevel: parseInt(formData.minStockLevel) || 5,
        imageUrl: formData.imageUrl.trim() || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        dimensions: (formData.dimensions.length || formData.dimensions.width || formData.dimensions.height) 
          ? JSON.stringify(formData.dimensions) 
          : null,
        specifications: formData.specifications.trim() 
          ? JSON.stringify(formData.specifications.split('\n').filter(s => s.trim())) 
          : null,
        tags: formData.tags.trim() 
          ? JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(t => t)) 
          : null,
        metaTitle: formData.metaTitle.trim() || null,
        metaDescription: formData.metaDescription.trim() || null,
        searchKeywords: formData.searchKeywords.trim() || null,
        isActive: true,
        isPublicListing: formData.isPublicListing,
        isTrackInventory: formData.isTrackInventory
      };

      const response = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create product');
      }

      const result = await response.json();
      
      Alert.alert(
        'Success!', 
        `Product "${formData.name}" has been created successfully.`,
        [
          {
            text: 'Create Another',
            onPress: () => {
              setFormData({
                name: '',
                description: '',
                category: formData.category, // Keep category for convenience
                brand: '',
                model: '',
                price: '',
                openingStock: '',
                minStockLevel: '',
                imageUrl: '',
                weight: '',
                dimensions: {
                  length: '',
                  width: '',
                  height: '',
                  unit: 'cm'
                },
                specifications: '',
                tags: '',
                metaTitle: '',
                metaDescription: '',
                searchKeywords: '',
                isPublicListing: true,
                isTrackInventory: true
              });
            }
          },
          {
            text: 'View Products',
            onPress: () => router.push('/(main)/product-management-table')
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={AppStyles.safeArea}>
      <Loading visible={loading} text="Creating product..." />
      
      <KeyboardAvoidingView 
        style={AppStyles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={AppStyles.container} 
          contentContainerStyle={AppStyles.padding}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={AppStyles.marginBottom}>
            <Text style={AppStyles.title}>Create New Product</Text>
            <Text style={[AppStyles.subtitle, AppStyles.marginTop]}>
              Add a new product to your store inventory
            </Text>
          </View>

          {/* Basic Information */}
          <View style={AppStyles.card}>
            <Text style={[AppStyles.title, AppStyles.marginBottom]}>Basic Information</Text>
            
            <CustomInput
              label="Product Name *"
              value={formData.name}
              onChangeText={(text) => updateFormData('name', text)}
              placeholder="Enter product name"
              maxLength={100}
            />

            <CustomInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => updateFormData('description', text)}
              placeholder="Describe your product..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={AppStyles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Category"
                  value={formData.category}
                  onChangeText={(text) => updateFormData('category', text)}
                  placeholder="e.g., Electronics"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <CustomInput
                  label="Brand"
                  value={formData.brand}
                  onChangeText={(text) => updateFormData('brand', text)}
                  placeholder="e.g., Apple"
                />
              </View>
            </View>

            <CustomInput
              label="Model"
              value={formData.model}
              onChangeText={(text) => updateFormData('model', text)}
              placeholder="Product model or version"
            />
          </View>

          {/* Pricing & Inventory */}
          <View style={AppStyles.card}>
            <Text style={[AppStyles.title, AppStyles.marginBottom]}>Pricing & Inventory</Text>
            
            <View style={AppStyles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <CustomInput
                  label="Price ($) *"
                  value={formData.price}
                  onChangeText={(text) => updateFormData('price', text)}
                  placeholder="0.00"
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <CustomInput
                  label="Opening Stock *"
                  value={formData.openingStock}
                  onChangeText={(text) => updateFormData('openingStock', text)}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CustomInput
              label="Minimum Stock Level"
              value={formData.minStockLevel}
              onChangeText={(text) => updateFormData('minStockLevel', text)}
              placeholder="5"
              keyboardType="numeric"
            />
          </View>

          {/* Product Details */}
          <View style={AppStyles.card}>
            <Text style={[AppStyles.title, AppStyles.marginBottom]}>Product Details</Text>
            
            <CustomInput
              label="Image URL"
              value={formData.imageUrl}
              onChangeText={(text) => updateFormData('imageUrl', text)}
              placeholder="https://example.com/image.jpg"
              autoCapitalize="none"
            />

            <CustomInput
              label="Weight (kg)"
              value={formData.weight}
              onChangeText={(text) => updateFormData('weight', text)}
              placeholder="0.0"
              keyboardType="numeric"
            />

            <Text style={AppStyles.inputLabel}>Dimensions (cm)</Text>
            <View style={AppStyles.row}>
              <View style={{ flex: 1, marginRight: 4 }}>
                <CustomInput
                  value={formData.dimensions.length}
                  onChangeText={(text) => updateFormData('dimensions.length', text)}
                  placeholder="Length"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <CustomInput
                  value={formData.dimensions.width}
                  onChangeText={(text) => updateFormData('dimensions.width', text)}
                  placeholder="Width"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1, marginLeft: 4 }}>
                <CustomInput
                  value={formData.dimensions.height}
                  onChangeText={(text) => updateFormData('dimensions.height', text)}
                  placeholder="Height"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CustomInput
              label="Specifications (one per line)"
              value={formData.specifications}
              onChangeText={(text) => updateFormData('specifications', text)}
              placeholder="Color: Blue&#10;Material: Plastic&#10;Warranty: 1 year"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <CustomInput
              label="Tags (comma separated)"
              value={formData.tags}
              onChangeText={(text) => updateFormData('tags', text)}
              placeholder="electronic, smartphone, mobile"
            />
          </View>

          {/* SEO & Settings */}
          <View style={AppStyles.card}>
            <Text style={[AppStyles.title, AppStyles.marginBottom]}>SEO & Settings</Text>
            
            <CustomInput
              label="Meta Title"
              value={formData.metaTitle}
              onChangeText={(text) => updateFormData('metaTitle', text)}
              placeholder="SEO title for search engines"
              maxLength={60}
            />

            <CustomInput
              label="Meta Description"
              value={formData.metaDescription}
              onChangeText={(text) => updateFormData('metaDescription', text)}
              placeholder="Brief description for search results"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              maxLength={160}
            />

            <CustomInput
              label="Search Keywords"
              value={formData.searchKeywords}
              onChangeText={(text) => updateFormData('searchKeywords', text)}
              placeholder="phone, mobile, device"
            />
          </View>

          {/* Action Buttons */}
          <View style={AppStyles.marginTop}>
            <CustomButton 
              title={loading ? 'Creating Product...' : 'Create Product'} 
              onPress={handleSubmit} 
              loading={loading}
              disabled={loading}
            />

            <CustomButton 
              title='Cancel' 
              variant='outline' 
              onPress={() => router.back()}
              style={{ marginTop: 12 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
