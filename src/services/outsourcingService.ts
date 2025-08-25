import { useToast } from '@/hooks/use-toast';

export interface OutsourcedSupplier {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  reliability: 'high' | 'medium' | 'low';
  avgDeliveryDays: number;
  specialties: string[];
  status: 'active' | 'inactive';
  rating: number; // 1-5 stars
  notes?: string;
}

export interface OutsourcedProduct {
  id: string;
  name: string;
  description: string;
  estimatedPrice: number;
  supplierId: number;
  supplierName: string;
  estimatedDelivery: number; // days
  category?: string;
  specifications?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OutsourcedOrder {
  id: string;
  quotationId?: number;
  orderId?: number;
  customerId?: number;
  customerName: string;
  product: OutsourcedProduct;
  quantity: number;
  agreedPrice: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'ordered' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  expectedDelivery: string;
  actualDelivery?: string;
  paymentStatus: 'pending' | 'advance_paid' | 'full_paid';
  advanceAmount?: number;
  supplierOrderRef?: string;
  trackingInfo?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

class OutsourcingService {
  private suppliers: OutsourcedSupplier[] = [
    {
      id: 1,
      name: "Quick Hardware Solutions",
      contact: "Rashid Ali",
      phone: "0300-1234567",
      email: "rashid@quickhardware.pk",
      address: "Main Market, Hall Road",
      city: "Lahore",
      reliability: 'high',
      avgDeliveryDays: 3,
      specialties: ["furniture hardware", "imported hinges", "premium handles"],
      status: 'active',
      rating: 4.8,
      notes: "Reliable supplier for premium imported hardware"
    },
    {
      id: 2,
      name: "Metro Hardware Traders",
      contact: "Saeed Ahmad",
      phone: "0321-9876543",
      email: "saeed@metrohardware.pk",
      address: "Urdu Bazaar",
      city: "Karachi",
      reliability: 'medium',
      avgDeliveryDays: 5,
      specialties: ["bulk fasteners", "industrial hardware", "custom brackets"],
      status: 'active',
      rating: 4.2,
      notes: "Good for bulk orders and custom items"
    },
    {
      id: 3,
      name: "Express Parts Supply",
      contact: "Imran Khan",
      phone: "0333-5555555",
      address: "GT Road",
      city: "Gujranwala",
      reliability: 'high',
      avgDeliveryDays: 2,
      specialties: ["emergency supplies", "rare parts", "quick delivery"],
      status: 'active',
      rating: 4.6,
      notes: "Best for urgent requirements"
    }
  ];

  private outsourcedOrders: OutsourcedOrder[] = [];

  // Get all outsourced suppliers
  getSuppliers(filters?: {
    status?: 'active' | 'inactive';
    city?: string;
    reliability?: 'high' | 'medium' | 'low';
    specialty?: string;
  }): OutsourcedSupplier[] {
    let filteredSuppliers = this.suppliers;

    if (filters) {
      if (filters.status) {
        filteredSuppliers = filteredSuppliers.filter(s => s.status === filters.status);
      }
      if (filters.city) {
        filteredSuppliers = filteredSuppliers.filter(s => 
          s.city.toLowerCase().includes(filters.city!.toLowerCase())
        );
      }
      if (filters.reliability) {
        filteredSuppliers = filteredSuppliers.filter(s => s.reliability === filters.reliability);
      }
      if (filters.specialty) {
        filteredSuppliers = filteredSuppliers.filter(s => 
          s.specialties.some(spec => 
            spec.toLowerCase().includes(filters.specialty!.toLowerCase())
          )
        );
      }
    }

    return filteredSuppliers.sort((a, b) => b.rating - a.rating);
  }

  // Add new outsourced supplier
  addSupplier(supplier: Omit<OutsourcedSupplier, 'id'>): OutsourcedSupplier {
    const newSupplier: OutsourcedSupplier = {
      ...supplier,
      id: Math.max(...this.suppliers.map(s => s.id), 0) + 1
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
  }

  // Update supplier
  updateSupplier(id: number, updates: Partial<OutsourcedSupplier>): boolean {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index !== -1) {
      this.suppliers[index] = { ...this.suppliers[index], ...updates };
      return true;
    }
    return false;
  }

  // Create outsourced product request
  createOutsourcedProduct(productData: {
    name: string;
    description: string;
    estimatedPrice: number;
    supplierId: number;
    category?: string;
    specifications?: string;
  }): OutsourcedProduct {
    const supplier = this.suppliers.find(s => s.id === productData.supplierId);
    if (!supplier) {
      throw new Error('Supplier not found');
    }

    const product: OutsourcedProduct = {
      id: `OP-${Date.now()}`,
      ...productData,
      supplierName: supplier.name,
      estimatedDelivery: supplier.avgDeliveryDays,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return product;
  }

  // Create outsourced order
  createOutsourcedOrder(orderData: {
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
  }): OutsourcedOrder {
    const order: OutsourcedOrder = {
      id: `OUT-${Date.now()}`,
      ...orderData,
      totalAmount: orderData.agreedPrice * orderData.quantity,
      status: 'pending',
      orderDate: new Date().toISOString(),
      paymentStatus: orderData.advanceAmount ? 'advance_paid' : 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.outsourcedOrders.push(order);
    return order;
  }

  // Get outsourced orders
  getOutsourcedOrders(filters?: {
    status?: OutsourcedOrder['status'];
    customerId?: number;
    supplierId?: number;
    dateFrom?: string;
    dateTo?: string;
  }): OutsourcedOrder[] {
    let orders = this.outsourcedOrders;

    if (filters) {
      if (filters.status) {
        orders = orders.filter(o => o.status === filters.status);
      }
      if (filters.customerId) {
        orders = orders.filter(o => o.customerId === filters.customerId);
      }
      if (filters.supplierId) {
        orders = orders.filter(o => o.product.supplierId === filters.supplierId);
      }
      if (filters.dateFrom) {
        orders = orders.filter(o => o.orderDate >= filters.dateFrom!);
      }
      if (filters.dateTo) {
        orders = orders.filter(o => o.orderDate <= filters.dateTo!);
      }
    }

    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Update outsourced order
  updateOutsourcedOrder(id: string, updates: Partial<OutsourcedOrder>): boolean {
    const index = this.outsourcedOrders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.outsourcedOrders[index] = {
        ...this.outsourcedOrders[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      return true;
    }
    return false;
  }

  // Get suitable suppliers for a product
  getSuitableSuppliers(productName: string, category?: string): OutsourcedSupplier[] {
    const searchTerm = productName.toLowerCase();
    const categoryTerm = category?.toLowerCase();

    return this.suppliers
      .filter(supplier => supplier.status === 'active')
      .filter(supplier => {
        // Check if supplier specializes in this type of product
        const hasRelevantSpecialty = supplier.specialties.some(specialty => 
          searchTerm.includes(specialty.toLowerCase()) || 
          specialty.toLowerCase().includes(searchTerm) ||
          (categoryTerm && specialty.toLowerCase().includes(categoryTerm))
        );
        
        return hasRelevantSpecialty;
      })
      .sort((a, b) => {
        // Sort by reliability and rating
        const reliabilityScore = { high: 3, medium: 2, low: 1 };
        const scoreA = reliabilityScore[a.reliability] * a.rating;
        const scoreB = reliabilityScore[b.reliability] * b.rating;
        return scoreB - scoreA;
      });
  }

  // Get order statistics
  getOrderStatistics(): {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalValue: number;
    avgDeliveryTime: number;
  } {
    const orders = this.outsourcedOrders;
    const completedOrders = orders.filter(o => o.status === 'delivered');
    
    const avgDeliveryTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => {
          if (order.actualDelivery) {
            const orderDate = new Date(order.orderDate);
            const deliveryDate = new Date(order.actualDelivery);
            const diffDays = Math.ceil((deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
            return sum + diffDays;
          }
          return sum;
        }, 0) / completedOrders.length
      : 0;

    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(o => ['pending', 'confirmed', 'ordered', 'shipped'].includes(o.status)).length,
      completedOrders: completedOrders.length,
      totalValue: orders.reduce((sum, o) => sum + o.totalAmount, 0),
      avgDeliveryTime: Math.round(avgDeliveryTime)
    };
  }

  // Search for products from suppliers (simulated API call)
  async searchProductFromSuppliers(query: string, category?: string): Promise<{
    supplier: OutsourcedSupplier;
    products: Array<{
      name: string;
      description: string;
      estimatedPrice: number;
      availability: 'in_stock' | 'order_required';
      deliveryDays: number;
    }>;
  }[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const suitableSuppliers = this.getSuitableSuppliers(query, category);
    
    // Simulate product search results from each supplier
    return suitableSuppliers.map(supplier => ({
      supplier,
      products: [
        {
          name: query,
          description: `${query} - Available from ${supplier.name}`,
          estimatedPrice: Math.floor(Math.random() * 1000) + 100,
          availability: Math.random() > 0.3 ? 'in_stock' : 'order_required',
          deliveryDays: supplier.avgDeliveryDays + (Math.random() > 0.5 ? 1 : 0)
        }
      ]
    }));
  }
}

export const outsourcingService = new OutsourcingService();