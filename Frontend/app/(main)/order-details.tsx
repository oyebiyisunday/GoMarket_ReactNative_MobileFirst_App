import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';

interface OrderItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productImage?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  shippingAmount: number;
  status: string;
  deliveryType: string;
  deliveryAddress?: string;
  deliveryNotes?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
  store: {
    businessName: string;
    storeId: string;
    address?: string;
    phone?: string;
    logoUrl?: string;
  };
}

export default function OrderDetailsScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { token, user } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      Alert.alert('Error', 'Order ID is required');
      router.back();
      return;
    }

    if (user?.userType !== 'individual') {
      Alert.alert('Access Denied', 'Only individual users can view order details.');
      router.replace('/(main)');
      return;
    }

    loadOrderDetails();
  }, [orderId, user, token]);

  const loadOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load order details');
      }

      const data = await response.json();
      setOrder(data.data);
    } catch (error) {
      console.error('Load order details error:', error);
      Alert.alert('Error', 'Failed to load order details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return '#ff9800';
      case 'confirmed': return '#2196f3';
      case 'processing': return '#9c27b0';
      case 'shipped': return '#4caf50';
      case 'delivered': return '#388e3c';
      case 'cancelled': return '#f44336';
      default: return '#666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shareOrderDetails = async () => {
    if (!order) return;

    const message = `Order #${order.orderNumber}
Store: ${order.store.businessName}
Total: $${order.totalAmount.toFixed(2)}
Status: ${order.status}
Date: ${formatDate(order.createdAt)}

Track your order in the GoMarket app!`;

    try {
      await Share.share({
        message,
        title: `Order #${order.orderNumber}`
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const contactStore = () => {
    if (!order?.store.phone) {
      Alert.alert('Contact Info', 'Store phone number not available');
      return;
    }

    Alert.alert(
      'Contact Store',
      `Call ${order.store.businessName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call', 
          onPress: () => {
            // In a real app, you would use Linking.openURL(`tel:${order.store.phone}`)
            Alert.alert('Phone', order.store.phone);
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Order not found</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
          </View>
        </View>
        <Text style={styles.orderDate}>Placed on {formatDate(order.createdAt)}</Text>
      </View>

      {/* Store Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Store Information</Text>
        <View style={styles.storeCard}>
          <View style={styles.storeHeader}>
            {order.store.logoUrl ? (
              <Image source={{ uri: order.store.logoUrl }} style={styles.storeLogo} />
            ) : (
              <View style={[styles.storeLogo, styles.logoPlaceholder]}>
                <Text style={styles.logoText}>🏪</Text>
              </View>
            )}
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{order.store.businessName}</Text>
              <Text style={styles.storeId}>Store ID: {order.store.storeId}</Text>
              {order.store.address && (
                <Text style={styles.storeAddress}>{order.store.address}</Text>
              )}
            </View>
          </View>
          {order.store.phone && (
            <TouchableOpacity style={styles.contactButton} onPress={contactStore}>
              <Text style={styles.contactButtonText}>📞 Contact Store</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        <View style={styles.itemsCard}>
          {order.orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <View style={styles.itemContent}>
                {item.productImage ? (
                  <Image source={{ uri: item.productImage }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.imagePlaceholder]}>
                    <Text style={styles.imagePlaceholderText}>📦</Text>
                  </View>
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.productName}</Text>
                  <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  <Text style={styles.itemUnitPrice}>Unit Price: ${item.unitPrice.toFixed(2)}</Text>
                </View>
                <Text style={styles.itemTotal}>${item.totalPrice.toFixed(2)}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Delivery Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Information</Text>
        <View style={styles.deliveryCard}>
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Type:</Text>
            <Text style={styles.deliveryValue}>
              {order.deliveryType === 'delivery' ? '🚚 Delivery' : '📍 Pickup'}
            </Text>
          </View>
          {order.deliveryAddress && (
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Address:</Text>
              <Text style={styles.deliveryValue}>{order.deliveryAddress}</Text>
            </View>
          )}
          {order.deliveryNotes && (
            <View style={styles.deliveryRow}>
              <Text style={styles.deliveryLabel}>Notes:</Text>
              <Text style={styles.deliveryValue}>{order.deliveryNotes}</Text>
            </View>
          )}
          <View style={styles.deliveryRow}>
            <Text style={styles.deliveryLabel}>Payment:</Text>
            <Text style={styles.deliveryValue}>{order.paymentMethod.replace('_', ' ').toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal:</Text>
            <Text style={styles.summaryValue}>${order.subtotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tax:</Text>
            <Text style={styles.summaryValue}>${order.taxAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Shipping:</Text>
            <Text style={styles.summaryValue}>${order.shippingAmount.toFixed(2)}</Text>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${order.totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={shareOrderDetails}>
          <Text style={styles.shareButtonText}>📤 Share Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.backToOrdersButton}
          onPress={() => router.push('/(main)/my-orders')}
        >
          <Text style={styles.backToOrdersButtonText}>← Back to Orders</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 18,
    color: '#f44336',
    marginBottom: 20
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold'
  },
  orderDate: {
    fontSize: 14,
    color: '#666'
  },
  section: {
    marginTop: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 20
  },
  storeCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  logoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoText: {
    fontSize: 20
  },
  storeInfo: {
    flex: 1
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  storeId: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  storeAddress: {
    fontSize: 12,
    color: '#666'
  },
  contactButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center'
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600'
  },
  itemsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  orderItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imagePlaceholderText: {
    fontSize: 20
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  itemUnitPrice: {
    fontSize: 12,
    color: '#666'
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2'
  },
  deliveryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  deliveryRow: {
    flexDirection: 'row',
    marginBottom: 8
  },
  deliveryLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    width: 80
  },
  deliveryValue: {
    fontSize: 14,
    color: '#666',
    flex: 1
  },
  summaryCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666'
  },
  summaryValue: {
    fontSize: 14,
    color: '#333'
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 8,
    marginTop: 8
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  totalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  actions: {
    padding: 20,
    paddingBottom: 40
  },
  shareButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  backToOrdersButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  backToOrdersButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600'
  }
});
