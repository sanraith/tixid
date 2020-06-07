# Tixid architecture overview

## Introduction

This document contains information about the general architecture of the components required to run the contest. Preview tool supporting *Mermaid* is required to view the diagrams.

## Overview

```mermaid
graph BT

subgraph AnyClient
    WB(Web Browser)
    C(Client scripts)
    CK((Cookies))
end

subgraph Tixid Server
    FE[Frontend service]
    MS[Match service]
    MP[Match process]
end

FE--Start/join match-->MS
MS--Spawn/conclude match-->MP
WB-->C
WB-->FE
C--Match events/actions---MP
C--Generate client id-->CK
```

## Technologies WIP

Server: node.js  
Database: no DB, state only stored runtime
Language: Typescript
UI: HTML5 + SASS?  
UI script: vanilla.js / jQuery / typescript?  
