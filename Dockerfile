FROM node:20-bookworm-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/app/.venv/bin:$PATH"

RUN apt-get update \
    && apt-get install --no-install-recommends -y python3 python3-venv tini \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt ./
RUN python3 -m venv .venv \
    && pip install --no-cache-dir -r requirements.txt

COPY frontend/package.json frontend/package-lock.json ./frontend/
RUN npm ci --prefix frontend

COPY backend ./backend
COPY frontend ./frontend
COPY start.py ./

EXPOSE 3000 8000

ENTRYPOINT ["/usr/bin/tini", "-g", "--"]
CMD ["python", "start.py"]
