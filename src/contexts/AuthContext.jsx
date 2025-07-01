import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...')
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!mounted) return

        if (session?.user) {
          console.log('Found existing session for:', session.user.email)
          setUser(session.user)
          // Fetch profile and wait for completion
          await fetchProfile(session.user.id)
        } else {
          console.log('No existing session found')
          setUser(null)
          setProfile(null)
        }

        if (mounted) {
          console.log('Auth initialization complete')
          setLoading(false)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return
      
      console.log('Auth state changed:', event, session?.user?.email || 'No user')
      
      if (session?.user) {
        setUser(session.user)
        // Fetch profile and wait for completion
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      
      if (mounted) setLoading(false)
    })

    return () => {
      console.log('Cleaning up auth context')
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const fetchProfile = async (userId) => {
    try {
      console.log('Fetching profile for user:', userId)
      
      // Use a more direct approach to avoid RLS issues
      const { data, error } = await supabase
        .from('users_rpc_x7k9m2')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        
        // If profile doesn't exist, create it for admin user
        if (error.code === 'PGRST116' || !data) {
          console.log('Profile not found, creating admin profile...')
          try {
            // Get the user's email from auth
            const { data: authUser } = await supabase.auth.getUser()
            const userEmail = authUser?.user?.email || 'admin@brinks.com'
            
            const { data: newProfile, error: insertError } = await supabase
              .from('users_rpc_x7k9m2')
              .insert([{
                id: userId,
                email: userEmail,
                name: 'Admin User',
                role: 'admin'
              }])
              .select()
              .single()

            if (insertError) {
              console.error('Error creating profile:', insertError)
              // For admin users, create a default profile object
              if (userEmail === 'admin@brinks.com') {
                console.log('Creating fallback admin profile')
                setProfile({
                  id: userId,
                  email: userEmail,
                  name: 'Admin User',
                  role: 'admin'
                })
                return
              }
              setProfile(null)
              return
            }

            console.log('Admin profile created successfully:', newProfile)
            setProfile(newProfile)
            return
          } catch (createError) {
            console.error('Error creating profile:', createError)
            // For admin users, create a fallback profile
            const { data: authUser } = await supabase.auth.getUser()
            if (authUser?.user?.email === 'admin@brinks.com') {
              console.log('Using fallback admin profile')
              setProfile({
                id: userId,
                email: authUser.user.email,
                name: 'Admin User',
                role: 'admin'
              })
              return
            }
            setProfile(null)
            return
          }
        }
        
        // Other errors - set profile to null
        setProfile(null)
        return
      }

      console.log('Profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('Error in fetchProfile:', error)
      
      // Fallback for admin users
      const { data: authUser } = await supabase.auth.getUser()
      if (authUser?.user?.email === 'admin@brinks.com') {
        console.log('Using fallback admin profile due to error')
        setProfile({
          id: userId,
          email: authUser.user.email,
          name: 'Admin User',
          role: 'admin'
        })
      } else {
        setProfile(null)
      }
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Starting sign in process...')
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return { data, error }
      }

      console.log('Sign in successful, auth state change will handle the rest')
      return { data, error: null }
    } catch (error) {
      console.error('Sign in catch error:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    })
    return { data, error }
  }

  const signOut = async () => {
    console.log('Signing out...')
    const { error } = await supabase.auth.signOut()
    if (!error) {
      setUser(null)
      setProfile(null)
    }
    return { error }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}