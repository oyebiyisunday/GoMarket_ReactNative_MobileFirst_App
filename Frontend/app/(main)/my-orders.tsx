import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useAuth } from '../../src/auth/useAuth';
import { API_BASE } from '../../src/lib/config';
import { router } from 'expo-router';

interface OrderItem {
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  productName: string;
  productImage?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  status: string;
  deliveryType: string;
  createdAt: string;
  orderItems: OrderItem[];
  store: {
    businessName: string;
    storeId: string;
    phone?: string;
    logoUrl?: string;
  };
}

export default function MyOrdersScreen() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.userType !== 'individual') {
      Alert.alert('Access Denied', 'Only individual users can view orders.');
      router.replace('/(main)');
      return;
    }
    loadOrders();
  }, [user, token]);

  const loadOrders = async () => {
    try {
      const response = await fetch(`${API_BASE}/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load orders');
      }

      const data = await response.json();
      setOrders(data.data || []);
    } catch (error) {
      console.error('Load orders error:', error);
      Alert.alert('Error', 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderOrderItem = (item: OrderItem, index: number) => (
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
          <Text style={styles.itemName} numberOfLines={2}>{item.productName}</Text>
          <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
          <Text style={styles.itemPrice}>${item.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );

  const renderOrder = (order: Order) => (
    <TouchableOpacity 
      key={order.id} 
      style={styles.orderCard}
      onPress={() => router.push(`/(main)/order-details?orderId=${order.id}`)}
    >
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.storeInfo}>
        {order.store.logoUrl ? (
          <Image source={{ uri: order.store.logoUrl }} style={styles.storeLogo} />
        ) : (
          <View style={[styles.storeLogo, styles.logoPlaceholder]}>
            <Text>🏪</Text>
          </View>
        )}
        <View style={styles.storeDetails}>
          <Text style={styles.storeName}>{order.store.businessName}</Text>
          <Text style={styles.deliveryType}>
            {order.deliveryType === 'delivery' ? '🚚 Delivery' : '📍 Pickup'}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.orderItems.slice(0, 2).map((item, index) => renderOrderItem(item, index))}
        {order.orderItems.length > 2 && (
          <Text style={styles.moreItems}>
            +{order.orderItems.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${order.totalAmount.toFixed(2)}</Text>
        <Text style={styles.itemCount}>
          {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your purchases and deliveries</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptyMessage}>
            Start shopping to see your orders here
          </Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.push('/(main)/shopping')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.ordersList}>
          {orders.map(renderOrder)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#666'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  emptyMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24
  },
  shopButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  },
  ordersList: {
    padding: 16
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  orderInfo: {
    flex: 1
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  orderDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold'
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  storeLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  logoPlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  storeDetails: {
    flex: 1
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  deliveryType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  orderItems: {
    marginBottom: 12
  },
  orderItem: {
    marginBottom: 8
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  itemImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
    marginRight: 8
  },
  imagePlaceholder: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center'
  },
  imagePlaceholderText: {
    fontSize: 12
  },
  itemDetails: {
    flex: 1
  },
  itemName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500'
  },
  itemQuantity: {
    fontSize: 12,
    color: '#666'
  },
  itemPrice: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600'
  },
  moreItems: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  itemCount: {
    fontSize: 12,
    color: '#666'
  }
});
