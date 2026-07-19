import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { authConfig } from './auth.config';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isPremium: user.isPremium,
          };
        }

        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        if (!user.email) return false;
        
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email }
        });

        if (!dbUser) {
          dbUser = await prisma.user.create({
            data: {
              email: user.email,
              name: user.name || profile?.name || 'Google User',
              role: 'USER',
            }
          });
        }

        if (account.providerAccountId) {
          await prisma.oAuthIdentity.upsert({
            where: {
              provider_providerUserId: {
                provider: 'google',
                providerUserId: account.providerAccountId
              }
            },
            update: {
              userId: dbUser.id
            },
            create: {
              provider: 'google',
              providerUserId: account.providerAccountId,
              userId: dbUser.id
            }
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email as string }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.isPremium = dbUser.isPremium;
          }
        } else {
          token.id = user.id;
          token.role = user.role;
          token.isPremium = user.isPremium;
        }
      } else if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, isPremium: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.isPremium = dbUser.isPremium;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.isPremium = token.isPremium as boolean;
      }
      return session;
    }
  }
});
