# QIND architecture overview

## Introduction

This document contains information about the general architecture of the components required to run the contest. Preview tool supporting *Mermaid* is required to view the diagrams.

## Overview

```mermaid
graph BT

subgraph AnyClient
    C(Web Browser)
end

subgraph QIND Server
    FE[Frontend service]
    MS[Match service]
    US[User service]
    DB((Database))
    MP[Match process]
end

FE--Start/join match-->MS
FE--Register & login-->US
US-->DB
MS--Create/Save/Load match-->DB
MS--Spawn/conclude match-->MP
C-->FE
C--Match events/actions---MP
```

## Technologies WIP

Server: node.js  
Database: MongoDB  
Language: Typescript?  
UI: HTML5 + CSS/LESS/SASS?  
UI script: vanilla.js / node.js / typescript?  
