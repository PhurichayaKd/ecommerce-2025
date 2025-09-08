'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { Product } from '@/lib/types'

export interface CartItem {
  id: string
  product: Product
  quantity: number
}

interface CartState {
  items: CartItem[]
  totalItems: number
  totalPrice: number
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: Product }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }

interface CartContextType {
  state: CartState
  addItem: (product: Product) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.product.id === action.payload.id)
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.product.id === action.payload.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
        
        return {
          ...state,
          items: updatedItems,
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + (action.payload.price || 0)
        }
      } else {
        const newItem: CartItem = {
          id: action.payload.id,
          product: action.payload,
          quantity: 1
        }
        
        return {
          ...state,
          items: [...state.items, newItem],
          totalItems: state.totalItems + 1,
          totalPrice: state.totalPrice + (action.payload.price || 0)
        }
      }
    }
    
    case 'REMOVE_ITEM': {
      const itemToRemove = state.items.find(item => item.product.id === action.payload)
      if (!itemToRemove) return state
      
      const updatedItems = state.items.filter(item => item.product.id !== action.payload)
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems - itemToRemove.quantity,
        totalPrice: state.totalPrice - (itemToRemove.product.price || 0) * itemToRemove.quantity
      }
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: id })
      }
      
      const itemToUpdate = state.items.find(item => item.product.id === id)
      if (!itemToUpdate) return state
      
      const quantityDiff = quantity - itemToUpdate.quantity
      const priceDiff = (itemToUpdate.product.price || 0) * quantityDiff
      
      const updatedItems = state.items.map(item =>
        item.product.id === id
          ? { ...item, quantity }
          : item
      )
      
      return {
        ...state,
        items: updatedItems,
        totalItems: state.totalItems + quantityDiff,
        totalPrice: state.totalPrice + priceDiff
      }
    }
    
    case 'CLEAR_CART': {
      return {
        items: [],
        totalItems: 0,
        totalPrice: 0
      }
    }
    
    default:
      return state
  }
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState)
  
  const addItem = (product: Product) => {
    dispatch({ type: 'ADD_ITEM', payload: product })
  }
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id })
  }
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } })
  }
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' })
  }
  
  return (
    <CartContext.Provider value={{
      state,
      addItem,
      removeItem,
      updateQuantity,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return {
    items: context.state.items,
    totalItems: context.state.totalItems,
    totalPrice: context.state.totalPrice,
    addItem: context.addItem,
    removeItem: context.removeItem,
    updateQuantity: context.updateQuantity,
    clearCart: context.clearCart
  }
}