package com.smartqueue.dto;

import com.smartqueue.model.CounterStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CounterRequestDTO {
    @NotBlank
    private String counterName;

    @Min(1)
    private int counterNumber;

    private boolean active = true;

    @NotNull
    private CounterStatus status;
}
