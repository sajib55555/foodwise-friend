
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
                health: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                    950: '#082f49',
                },
                purple: {
                    50: '#f5f3ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#8b5cf6',
                    600: '#7c3aed',
                    700: '#6d28d9',
                    800: '#5b21b6',
                    900: '#4c1d95',
                    950: '#2e1065',
                },
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
            fontFamily: {
                sans: ['Inter var', 'sans-serif'],
            },
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' }
                },
                'fade-out': {
                    '0%': { opacity: '1' },
                    '100%': { opacity: '0' }
                },
                'slide-in': {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' }
                },
                'slide-out': {
                    '0%': { transform: 'translateY(0)', opacity: '1' },
                    '100%': { transform: 'translateY(20px)', opacity: '0' }
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.8' }
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' }
                },
                'scale': {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' }
                }
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.5s ease-out',
                'fade-out': 'fade-out 0.5s ease-out',
                'slide-in': 'slide-in 0.5s ease-out',
                'slide-out': 'slide-out 0.5s ease-out',
                'pulse-soft': 'pulse-soft 2s infinite ease-in-out',
                'float': 'float 6s infinite ease-in-out',
                'scale': 'scale 0.5s ease-out',
			},
            backdropFilter: {
                'none': 'none',
                'blur': 'blur(20px)',
            },
            boxShadow: {
                'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
                'glass-sm': '0 2px 10px rgba(0, 0, 0, 0.05)',
                'purple': '0 4px 14px rgba(124, 58, 237, 0.25)',
                'purple-lg': '0 10px 25px -5px rgba(124, 58, 237, 0.3)',
                'purple-sm': '0 2px 8px rgba(124, 58, 237, 0.15)',
                // Adding missing shadow classes
                'blue': '0 4px 14px rgba(59, 130, 246, 0.25)',
                'blue-lg': '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
                'green': '0 4px 14px rgba(34, 197, 94, 0.25)',
                'green-lg': '0 10px 25px -5px rgba(34, 197, 94, 0.3)',
                'amber': '0 4px 14px rgba(245, 158, 11, 0.25)',
                'amber-lg': '0 10px 25px -5px rgba(245, 158, 11, 0.3)',
                'pink': '0 4px 14px rgba(236, 72, 153, 0.25)',
                'pink-lg': '0 10px 25px -5px rgba(236, 72, 153, 0.3)',
                'primary': '0 4px 14px rgba(124, 58, 237, 0.25)',
                'primary-lg': '0 10px 25px -5px rgba(124, 58, 237, 0.3)',
            },
            backgroundImage: {
                'gradient-purple': 'linear-gradient(135deg, #9b87f5 0%, #7c3aed 100%)',
                'gradient-purple-soft': 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%)',
                'gradient-premium': 'linear-gradient(135deg, #9b87f5 0%, #7c3aed 100%)',
                'gradient-button-purple': 'linear-gradient(to right, #9b87f5, #7c3aed)',
            }
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
