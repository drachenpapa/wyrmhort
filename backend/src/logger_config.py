import logging
import os

_LOG_LEVEL: int = getattr(logging, os.environ.get("LOG_LEVEL", "INFO").upper(), logging.INFO)


def setup_logger(name: str) -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = logging.StreamHandler()
        handler.setFormatter(
            logging.Formatter(
                "[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s",
                datefmt="%Y-%m-%dT%H:%M:%S",
            )
        )
        logger.addHandler(handler)
        logger.setLevel(_LOG_LEVEL)
        logger.propagate = False
    return logger
