from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from jwt import ExpiredSignatureError, InvalidTokenError
from colorama import Fore, Style
import jwt
import os

# Environment variables for security
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login")
SECRET_KEY = os.environ.get("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def get_secret_key():
    return SECRET_KEY


def verify_token(
    token: str = Depends(oauth2_scheme), secret_key: str = Depends(get_secret_key)
) -> dict:
    """Verify the key"""
    try:
        decoded = jwt.decode(token, secret_key, algorithms=[ALGORITHM])
        # The decode also validates the expiration time (TODO check this)
    except ExpiredSignatureError:
        # Handle token expiration specifically
        print(f"{Fore.RED}Token expired{Style.RESET_ALL}")
        raise HTTPException(status_code=401, detail="Token has expired")
    except InvalidTokenError:
        # Handle other token errors (like signature mismatch)
        print(f"{Fore.RED}Invalid token{Style.RESET_ALL}")
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as e:
        # Handle any other errors
        print(f"{Fore.RED}Error decoding token{Style.RESET_ALL}")
        raise HTTPException(status_code=401, detail="Error decoding token")
    return decoded
