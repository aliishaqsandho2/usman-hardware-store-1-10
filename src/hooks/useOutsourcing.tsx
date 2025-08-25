import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { 
  outsourcingService, 
  OutsourcedSupplier, 
  OutsourcedProduct, 
  OutsourcedOrder 
} from '@/services/outsourcingService';

export const useOutsourcing = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Search for products from external suppliers
  const searchExternalProducts = async (query: string, category?: string) => {
    try {
      setLoading(true);
      const results = await outsourcingService.searchProductFromSuppliers(query, category);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast({
          title: "No Results",
          description: "No external suppliers found for this product",
          variant: "destructive"
        });
      }
      
      return results;
    } catch (error) {
      console.error('Error searching external products:', error);
      toast({
        title: "Search Error",
        description: "Failed to search external suppliers",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create outsourced order
  const createOutsourcedOrder = async (orderData: {
    quotationId?: number;
    orderId?: number;
    customerId?: number;
    customerName: string;
    product: OutsourcedProduct;
    quantity: number;
    agreedPrice: number;
    expectedDelivery: string;
    advanceAmount?: number;
    notes?: string;
  }) => {
    try {
      setLoading(true);
      const order = outsourcingService.createOutsourcedOrder(orderData);
      
      toast({
        title: "Outsourced Order Created",
        description: `Order ${order.id} created successfully`,
      });
      
      return { success: true, order };
    } catch (error) {
      console.error('Error creating outsourced order:', error);
      toast({
        title: "Error",
        description: "Failed to create outsourced order",
        variant: "destructive"
      });
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const updateOrderStatus = async (orderId: string, status: OutsourcedOrder['status'], notes?: string) => {
    try {
      const success = outsourcingService.updateOutsourcedOrder(orderId, { 
        status, 
        notes,
        ...(status === 'delivered' && { actualDelivery: new Date().toISOString() })
      });
      
      if (success) {
        toast({
          title: "Order Updated",
          description: `Order status updated to ${status}`,
        });
      } else {
        toast({
          title: "Update Failed",
          description: "Order not found",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
      return false;
    }
  };

  // Get suppliers
  const getSuppliers = (filters?: {
    status?: 'active' | 'inactive';
    city?: string;
    reliability?: 'high' | 'medium' | 'low';
    specialty?: string;
  }): OutsourcedSupplier[] => {
    return outsourcingService.getSuppliers(filters);
  };

  // Get outsourced orders
  const getOutsourcedOrders = (filters?: {
    status?: OutsourcedOrder['status'];
    customerId?: number;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): OutsourcedOrder[] => {
    return outsourcingService.getOutsourcedOrders(filters);
  };

  // Get suitable suppliers for a product
  const getSuitableSuppliers = (productName: string, category?: string): OutsourcedSupplier[] => {
    return outsourcingService.getSuitableSuppliers(productName, category);
  };

  // Get order statistics
  const getOrderStatistics = () => {
    return outsourcingService.getOrderStatistics();
  };

  // Add new supplier
  const addSupplier = (supplier: Omit<OutsourcedSupplier, 'id'>) => {
    try {
      const newSupplier = outsourcingService.addSupplier(supplier);
      toast({
        title: "Supplier Added",
        description: `${newSupplier.name} added successfully`,
      });
      return { success: true, supplier: newSupplier };
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "Error",
        description: "Failed to add supplier",
        variant: "destructive"
      });
      return { success: false };
    }
  };

  return {
    // State
    loading,
    searchResults,
    
    // Actions
    searchExternalProducts,
    createOutsourcedOrder,
    updateOrderStatus,
    getSuppliers,
    getOutsourcedOrders,
    getSuitableSuppliers,
    getOrderStatistics,
    addSupplier
  };
};