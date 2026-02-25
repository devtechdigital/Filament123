# LAN HTTPS Setup

## DNS
Set `filament.home` to your app host:

- `filament.home -> 192.168.1.10`

## Docker
Run app container with host mapping:

- `3005 -> 3000`

## Caddy
Use standalone Caddy on LAN edge:

```caddy
filament.home {
  tls internal
  reverse_proxy 192.168.1.10:3005
}
```

## Android Trust
Install Caddy root CA on Android and trust it for websites so Chrome accepts `https://filament.home`.

## NFC Requirements
- Android Chrome
- HTTPS origin (trusted)
- User gesture to trigger NFC read/write
