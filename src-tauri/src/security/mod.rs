use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};

#[derive(Debug, thiserror::Error)]
pub enum SecurityError {
    #[error("failed to hash password")]
    Hash,
    #[error("invalid stored password hash")]
    InvalidStoredHash,
}

pub fn hash_password(password: &str) -> Result<String, SecurityError> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    argon2
        .hash_password(password.as_bytes(), &salt)
        .map(|hash| hash.to_string())
        .map_err(|_| SecurityError::Hash)
}

pub fn verify_password(password: &str, stored_hash: &str) -> Result<bool, SecurityError> {
    let parsed_hash =
        PasswordHash::new(stored_hash).map_err(|_| SecurityError::InvalidStoredHash)?;
    Ok(Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn hashes_and_verifies_correct_password() {
        let hash = hash_password("correct horse battery staple").unwrap();
        assert!(verify_password("correct horse battery staple", &hash).unwrap());
    }

    #[test]
    fn rejects_wrong_password() {
        let hash = hash_password("correct horse battery staple").unwrap();
        assert!(!verify_password("wrong password", &hash).unwrap());
    }
}