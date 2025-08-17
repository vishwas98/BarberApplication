import "./globals.css";

export const metadata = {
  title: "Barber Booking",
  description: "Minimal barber booking app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 900, margin: "24px auto", padding: 12 }}>
          <h1>Barber Booking</h1>
          {children}
        </main>
      </body>
    </html>
  );
}