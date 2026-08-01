# 💵 Markk'd Bills

## Overview

**Markk'd Bills** is a currency-based match-3 game where players collect real-world currency symbols, earn different currencies, trade currencies through a randomized global exchange market, convert their earnings into USD, and finally exchange USD into **Markkade**.

Markk'd Bills turns currency collecting into a strategy game where players must decide when to hold, trade, and exchange currencies.

---

# 🎮 Core Gameplay Loop

```
Match Currency Symbols
          ↓
Earn Currency Bills
          ↓
Store Currency In Wallet
          ↓
Trade Through Global Exchange
          ↓
Convert To USD
          ↓
Exchange USD To Markkade
          ↓
Use Markkade Across Games
```

---

# 💱 Match-3 Currency System

Players match 3 or more identical currency symbols.

Example:

```
€   €   €
```

Reward:

```
+ €1.00 EUR
```

The currency earned goes directly into the player's wallet.

---

# 🌎 Supported Currency Bills

| Symbol | Currency | 1.00 Currency Converts To USD |
|---|---|---:|
| $ | US Dollar | $1.00 |
| € | Euro | ~$1.15 |
| £ | British Pound | ~$1.35 |
| ¥ | Japanese Yen | ~$0.006 |
| ¥ | Chinese Yuan | ~$0.14 |
| ₣ | Swiss Franc | ~$1.20 |
| C$ | Canadian Dollar | ~$0.73 |
| A$ | Australian Dollar | ~$0.67 |
| ₹ | Indian Rupee | ~$0.012 |
| ₩ | South Korean Won | ~$0.0007 |
| ₽ | Russian Ruble | ~$0.011 |
| R$ | Brazilian Real | ~$0.18 |
| ₺ | Turkish Lira | ~$0.025 |
| ₱ | Philippine Peso | ~$0.017 |
| ₫ | Vietnamese Dong | ~$0.00004 |
| ₿ | Bitcoin | Market Value |
| Ξ | Ethereum | Market Value |

---

# 🏦 Player Currency Wallet

Players collect multiple currencies.

Example:

```
MARKK'D BILLS WALLET

USD
$25.00

EUR
€80.00

GBP
£15.00

JPY
¥5000

BTC
0.002 BTC
```

---

# 🔄 Global Currency Exchange

Players can trade currencies, but not every exchange is always available.

The exchange market changes randomly.

Example:

```
GLOBAL EXCHANGE MARKET

AVAILABLE:

€ → $
€ → £
¥ → €

LOCKED:

₣ → $
₿ → $
₹ → €
```

---

# 🎲 Random Exchange System

Each player receives a changing exchange market.

The goal is to find the best trading path.

Example:

```
MARKET UPDATE

OPEN:

EUR → USD
JPY → EUR
GBP → USD


CLOSED:

BTC → USD
CHF → EUR
```

---

# ⏱️ Exchange Availability Timer

The Global Exchange Market operates on a timed rotation system.

Players can always see when the next market update will happen.

---

# 🌎 Global Exchange Countdown

Example:

```
GLOBAL EXCHANGE MARKET

Next Market Update:

⏱️ 04:32

Available Exchanges:

€ → $
€ → £
¥ → €

Locked Exchanges:

₿ → $
₣ → €
₹ → $
```

When the timer reaches zero:

```
00:00

MARKET UPDATED
```

A new random exchange market is generated.

---

# 🔄 Exchange Refresh System

The exchange availability changes automatically.

Example:

```
Current Market:

OPEN

€ → $
£ → €
¥ → £


Timer:

⏱️ 02:15
```

After refresh:

```
NEW MARKET

OPEN

¥ → $
₿ → €
₹ → £


Timer:

⏱️ 05:00
```

---

# ⏰ Timer Rules

- Timer is always visible in the exchange screen
- Players cannot manually force a refresh
- All available trades remain active until the timer expires
- When the timer reaches zero, the market randomly changes
- Players must decide whether to trade now or wait

---

# 🎲 Market Timing Strategy

Players must choose:

## Trade Now

Example:

```
€ → $

AVAILABLE

Convert immediately
```

Risk:

```
Better routes may appear later
```

---

## Wait For Update

Example:

```
Current:

€ → £

Waiting...

⏱️ 00:45
```

Risk:

```
Current exchange may disappear
```

---

# 🔔 Market Update Notifications

When the timer expires:

Player receives:

```
🌎 GLOBAL MARKET UPDATED

New exchanges are available!

Check your wallet.
```

---

# UI Display

Exchange screen header:

```
💱 GLOBAL EXCHANGE

Market Refresh:
⏱️ 03:59

Current Trading Routes:
12 Available
8 Locked
```

---

# Advanced Features

## VIP Market Scanner

Allows players to preview:

```
Upcoming Market Probability:

€ → $
75% Chance

₿ → USD
25% Chance
```

## Emergency Exchange

Rare event:

```
⚡ FLASH MARKET

All exchanges unlocked

Duration:
60 seconds
```

---

# 🔁 Currency Trading Routes

Players may need multiple trades to reach USD.

Example:

Player owns:

```
¥10,000 JPY
```

Direct:

```
¥ → USD

Unavailable
```

Alternative:

```
¥10,000
      ↓
JPY → EUR

€60
      ↓
EUR → GBP

£50
      ↓
GBP → USD

$67 USD
```

---

# 🎰 Trading Risk

Currency values can change.

Players choose whether to:

## Hold

Keep currency:

```
€100
```

## Trade

Exchange:

```
€ → ₿
```

Possible outcomes:

```
Currency rises:
More USD value

Currency falls:
Less USD value
```

---

# 💵 USD Cash Out

USD is the final conversion currency.

Example:

```
Wallet:

$50.00 USD
```

Player exchanges:

```
USD → Markkade
```

Result:

```
$50 USD

Converted Into

Markkade Balance
```

---

# 🪙 Markkade Integration

Markkade is the universal currency used across the Markkade ecosystem.

```
MARKK'D BILLS
        ↓
Currency Trading
        ↓
USD
        ↓
MARKKADE
        ↓
Other Games
```

---

# 🏆 Player Goals

Players compete to:

- Collect rare currencies
- Build their currency wallet
- Discover profitable exchange routes
- Predict market changes
- Convert currencies into USD
- Earn Markkade
- Spend Markkade across the gaming platform

---

# Future Features

## Global Market Events

Examples:

```
WORLD ECONOMY EVENT

USD ↑
EUR ↓
BTC ↑↑
```

---

## Rare Currency Drops

Special matches can reward:

```
₿ Bitcoin
Ξ Ethereum
Gold Currency
Diamond Currency
```

---

## Seasonal Markets

Examples:

```
Season 1:
Dollar Rush

Season 2:
Crypto Market

Season 3:
Global Exchange
```
